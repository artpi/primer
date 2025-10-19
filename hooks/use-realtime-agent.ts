"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { RealtimeSessionEventTypes } from "@openai/agents-realtime"
import { RealtimeAgent, RealtimeSession } from "@openai/agents-realtime"

type OrbState = "idle" | "listening" | "thinking" | "speaking"

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

	const [isConnected, setIsConnected] = useState(false)
	const [isConnecting, setIsConnecting] = useState(false)
	const [currentState, setCurrentState] = useState<OrbState>("idle")
	const [latestTranscript, setLatestTranscript] = useState("")
	const [latestResponse, setLatestResponse] = useState("")

	const sessionRef = useRef<RealtimeSession | undefined>(undefined)
	const agentRef = useRef<RealtimeAgent | undefined>(undefined)
	const audioElementRef = useRef<HTMLAudioElement | undefined>(undefined)

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

	const registerSessionListeners = useCallback(
		(session: RealtimeSession) => {
			// Log all transport events for debugging
			session.on("transport_event", (event) => {
				console.log("[Primer] Transport event:", event.type, event)
				
				if (event.type === "connection_change") {
					console.log("[Primer] Connection status changed")
					handleStateChange("listening")
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
				handleStateChange("listening")
			})

			session.on("audio_interrupted", (context, agent) => {
				console.log("[Primer] Audio interrupted", { agent: agent.name })
				handleStateChange("listening")
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
				alert("Realtime session error. Please check the console for details.")
				setIsConnected(false)
				handleStateChange("idle")
			})
		},
		[handleStateChange],
	)

	const connect = useCallback(async () => {
		if (isConnecting || isConnected) {
			return
		}

		// Read from localStorage only when connecting (client-side event handler)
		const apiKey = localStorage.getItem("primer_api_key")
		const systemPrompt =
			localStorage.getItem("primer_system_prompt") ||
			"You are Primer, a friendly and patient AI tutor for children. You explain things in simple, engaging ways and encourage curiosity and learning. You are kind, supportive, and always make learning fun."

		if (!apiKey) {
			alert("Please set your OpenAI API key in settings first!")
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
				instructions: systemPrompt,
				voice: "alloy",
			})
			agentRef.current = agent
			console.log("[Primer] Created RealtimeAgent:", agent.name)

			const sessionConfig = {
				config: {
					model: "gpt-realtime",
					instructions: systemPrompt,
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
			await session.connect({
				apiKey: ephemeralKey,
				model: "gpt-realtime",
			})

			console.log("[Primer] Successfully connected! Transport:", session.transport)
			console.log("[Primer] Current agent:", session.currentAgent.name)
			console.log("[Primer] Microphone should be active now")

                        setIsConnected(true)
                        handleStateChange("listening")
                        console.log("[Primer] Ready to chat!")

                        const welcomeInstructions =
                                "Speak a short, encouraging welcome so the child knows you are ready to chat. Say something like: \"Hi there! I'm Primer, your learning buddy. What would you like to explore today?\""

                        session.transport.sendEvent({
                                type: "response.create",
                                response: {
                                        instructions: welcomeInstructions,
                                },
                        })
		}
		catch (error) {
			console.error("[Primer] Failed to connect to realtime session", error)
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
	}, [handleStateChange, isConnected, isConnecting, registerSessionListeners])

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
			handleStateChange("listening")
			console.log("[Primer] Response interrupted")
		}
	}, [handleStateChange])

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

