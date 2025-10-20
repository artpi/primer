"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState } from "react"

import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime"


type OrbState = "idle" | "muted" | "listening" | "thinking" | "speaking"

interface UseRealtimeAgentOptions {
	onStateChange?: (state: OrbState) => void
}

interface UseRealtimeAgentResult {
	isConnected: boolean
	isConnecting: boolean
	currentState: OrbState
	latestTranscript: string
	latestResponse: string
	connect: () => Promise<void>
	disconnect: () => void
	interrupt: () => void
}

export function useRealtimeAgent(options: UseRealtimeAgentOptions = {}): UseRealtimeAgentResult {
        const { onStateChange } = options

        const orbT = useTranslations("orb")
        const settingsT = useTranslations("settings")
        const [isConnected, setIsConnected] = useState(false)
	const [isConnecting, setIsConnecting] = useState(false)
	const [currentState, setCurrentState] = useState<OrbState>("idle")
	const [latestTranscript, setLatestTranscript] = useState("")
	const [latestResponse, setLatestResponse] = useState("")

	const sessionRef = useRef<RealtimeSession | undefined>(undefined)
	const agentRef = useRef<RealtimeAgent | undefined>(undefined)
	const audioElementRef = useRef<HTMLAudioElement | undefined>(undefined)
        const initialMuteTimeoutRef = useRef<number | undefined>(undefined)
        const initialMuteActiveRef = useRef(false)

	useEffect(() => {
		return () => {
			if (sessionRef.current) {
				sessionRef.current.close()
				sessionRef.current = undefined
			}
		}
	}, [])

	const handleStateChange = useCallback(
		(nextState: OrbState) => {
			setCurrentState(nextState)
			onStateChange?.(nextState)
		},
		[onStateChange],
	)

        const updateListeningState = useCallback(() => {
                handleStateChange(initialMuteActiveRef.current ? "muted" : "listening")
        }, [handleStateChange])

        const registerSessionListeners = useCallback(
		(session: RealtimeSession) => {
			// Log all transport events for debugging
                        session.on("transport_event", (event) => {
                                console.log("[Primer] Transport event:", event.type, event)

                                if (event.type === "connection_change") {
                                        console.log("[Primer] Connection status changed")
                                        updateListeningState()
                                }
                        })

			session.on("agent_start", (context, agent) => {
				console.log("[Primer] Agent started responding", { agent: agent.name, context })
				handleStateChange("thinking")
			})

			session.on("agent_end", (context, agent, output) => {
				console.log("[Primer] Agent finished responding", { agent: agent.name, output })
			})

			session.on("audio_start", (context, agent) => {
				console.log("[Primer] Audio output started", { agent: agent.name })
				handleStateChange("speaking")
			})

                        session.on("audio_stopped", (context, agent) => {
                                console.log("[Primer] Audio output stopped", { agent: agent.name })
                                updateListeningState()
                        })

                        session.on("audio_interrupted", (context, agent) => {
                                console.log("[Primer] Audio interrupted", { agent: agent.name })
                                updateListeningState()
                        })

			session.on("history_updated", (history) => {
				console.log("[Primer] History updated, items:", history.length)
				console.log("[Primer] Latest history items:", history.slice(-3))
			})

			session.on("history_added", (item) => {
				console.log("[Primer] History item added:", item)
			})

			session.on("agent_tool_start", (context, agent, tool, details) => {
				console.log("[Primer] Tool call started", { tool: tool.name, details })
			})

			session.on("agent_tool_end", (context, agent, tool, result, details) => {
				console.log("[Primer] Tool call ended", { tool: tool.name, result, details })
			})

                        session.on("error", (event) => {
                                console.error("[Primer] Realtime session error:", event)
                                alert(orbT("errors.session"))
                                setIsConnected(false)
                                handleStateChange("idle")
                        })
                },
                [handleStateChange, orbT, updateListeningState],
        )

	const connect = useCallback(async () => {
		if (isConnecting || isConnected) {
			return
		}

                // Read from localStorage only when connecting (client-side event handler)
                const apiKey = localStorage.getItem("primer_api_key")
                const storedPrompt = localStorage.getItem("primer_system_prompt")
                const defaultPrompt = settingsT("prompt.default")
                const basePrompt = storedPrompt && storedPrompt.trim().length > 0 ? storedPrompt : defaultPrompt
                const languageInstruction = orbT("prompt.languageInstruction")
                const instructions = [basePrompt.trim(), languageInstruction].filter(Boolean).join("\n\n")

                if (!apiKey) {
                        alert(orbT("errors.apiKeyMissing"))
                        return
                }

		setIsConnecting(true)

		try {
			// Exchange regular API key for ephemeral client key
			console.log("[Primer] Exchanging API key for ephemeral client key...")
			const clientSecretResponse = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					session: {
						type: "realtime",
						model: "gpt-realtime",
					},
				}),
			})

			if (!clientSecretResponse.ok) {
				const errorText = await clientSecretResponse.text()
				throw new Error(`Failed to get ephemeral key: ${clientSecretResponse.status} ${errorText}`)
			}

			const clientSecretData = await clientSecretResponse.json()
			const ephemeralKey = clientSecretData.value

			if (!ephemeralKey || !ephemeralKey.startsWith("ek_")) {
				throw new Error("Invalid ephemeral key received from OpenAI")
			}

			console.log("[Primer] Successfully obtained ephemeral key:", ephemeralKey.substring(0, 10) + "...")

                        const agent = new RealtimeAgent({
                                name: "Primer",
                                instructions,
                                voice: "alloy",
                        })
			agentRef.current = agent
			console.log("[Primer] Created RealtimeAgent:", agent.name)

                        const sessionConfig = {
                                config: {
                                        model: "gpt-realtime",
                                        instructions,
					toolChoice: "auto" as const,
					tools: [],
					audio: {
						input: {
							turnDetection: {
								type: "server_vad" as const,
								threshold: 0.65,
								prefixPaddingMs: 450,
								silenceDurationMs: 1200,
							},
							transcription: {
								model: "gpt-4o-mini-transcribe",
							},
						},
					output: {
							voice: "alloy",
						},
					},
				},
			}

			console.log("[Primer] Session config:", sessionConfig)

			const session = new RealtimeSession(agent, sessionConfig)
			sessionRef.current = session
			console.log("[Primer] Created RealtimeSession")

			registerSessionListeners(session)
                        console.log("[Primer] Registered session listeners")

                        // Use ephemeral key for WebRTC connection
                        console.log("[Primer] Connecting to OpenAI Realtime API...")
                        initialMuteActiveRef.current = true
                        await session.connect({
                                apiKey: ephemeralKey,
                                model: "gpt-realtime",
                        })

                        console.log("[Primer] Successfully connected! Transport:", session.transport)
                        console.log("[Primer] Current agent:", session.currentAgent.name)
                        console.log("[Primer] Microphone should be active now")

                        setIsConnected(true)
                        handleStateChange("muted")
                        console.log("[Primer] Ready to chat!")

                        const welcomeInstructions = [
                                orbT("prompt.welcome"),
                                languageInstruction,
                        ]
                                .filter(Boolean)
                                .join("\n\n")

                        session.mute(true)
                        console.log("[Primer] Muted microphone for welcome message")

			if (initialMuteTimeoutRef.current) {
				window.clearTimeout(initialMuteTimeoutRef.current)
			}

                        initialMuteTimeoutRef.current = window.setTimeout(() => {
                                if (!sessionRef.current) {
                                        return
                                }

                                sessionRef.current.mute(false)
                                initialMuteActiveRef.current = false
                                initialMuteTimeoutRef.current = undefined
                                console.log("[Primer] Unmuted microphone after welcome window")
                                handleStateChange("listening")
                        }, 5000)

			session.transport.sendEvent({
				type: "response.create",
				response: {
					instructions: welcomeInstructions,
				},
			})
		}
		catch (error) {
                        console.error("[Primer] Failed to connect to realtime session", error)
                        if (initialMuteTimeoutRef.current) {
                                window.clearTimeout(initialMuteTimeoutRef.current)
                                initialMuteTimeoutRef.current = undefined
                        }
                        initialMuteActiveRef.current = false
                        alert(
				error instanceof Error
					? `Failed to connect: ${error.message}`
					: "Failed to connect to the realtime session. Please check your API key and microphone permissions.",
			)
			handleStateChange("idle")
		}
                finally {
                        setIsConnecting(false)
                }
        }, [handleStateChange, isConnected, isConnecting, orbT, registerSessionListeners, settingsT])

	const disconnect = useCallback(() => {
		console.log("[Primer] Disconnecting...")
		if (sessionRef.current) {
			sessionRef.current.close()
			sessionRef.current = undefined
			console.log("[Primer] Session closed")
		}
		if (audioElementRef.current) {
			audioElementRef.current.pause()
			audioElementRef.current.src = ""
			audioElementRef.current = undefined
			console.log("[Primer] Audio element cleaned up")
		}

                if (initialMuteTimeoutRef.current) {
                        window.clearTimeout(initialMuteTimeoutRef.current)
                        initialMuteTimeoutRef.current = undefined
                }
                initialMuteActiveRef.current = false
                setIsConnected(false)
                setLatestResponse("")
                setLatestTranscript("")
                handleStateChange("idle")
                console.log("[Primer] Disconnected successfully")
        }, [handleStateChange])

        const interrupt = useCallback(() => {
                console.log("[Primer] Interrupting current response...")
                if (sessionRef.current) {
                        sessionRef.current.interrupt()
                        updateListeningState()
                        console.log("[Primer] Response interrupted")
                }
        }, [handleStateChange, updateListeningState])

	return {
		isConnected,
		isConnecting,
		currentState,
		latestTranscript,
		latestResponse,
		connect,
		disconnect,
		interrupt,
	}
}

