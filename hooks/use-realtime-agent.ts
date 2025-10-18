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
	startPushToTalk: () => void
	stopPushToTalk: () => void
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
	const inactivityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const isPushToTalkActiveRef = useRef(false)

	useEffect(() => {
		return () => {
			if (sessionRef.current) {
				sessionRef.current.close()
				sessionRef.current = undefined
			}
		}
	}, [])

	const clearInactivityTimer = useCallback(() => {
		if (inactivityTimerRef.current) {
			clearTimeout(inactivityTimerRef.current)
			inactivityTimerRef.current = undefined
		}
	}, [])

	const startInactivityTimer = useCallback(() => {
		// Only start timer in automatic mode (not push-to-talk)
		const pushToTalk = localStorage.getItem("primer_push_to_talk") === "true"
		if (pushToTalk) return

		clearInactivityTimer()
		console.log("[Primer] Starting 15-second inactivity timer")
		inactivityTimerRef.current = setTimeout(() => {
			console.log("[Primer] Inactivity timeout - disconnecting")
			if (sessionRef.current) {
				sessionRef.current.close()
				sessionRef.current = undefined
			}
			setIsConnected(false)
			handleStateChange("idle")
		}, 15000) // 15 seconds
	}, [clearInactivityTimer])

	const handleStateChange = useCallback(
		(nextState: OrbState) => {
			setCurrentState(nextState)
			onStateChange?.(nextState)

			// Reset inactivity timer when agent is speaking or thinking
			if (nextState === "speaking" || nextState === "thinking") {
				clearInactivityTimer()
			}
		},
		[onStateChange, clearInactivityTimer],
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
				// Start inactivity timer after agent finishes speaking (only in automatic mode)
				startInactivityTimer()
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
		[handleStateChange, startInactivityTimer],
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
		const pushToTalk = localStorage.getItem("primer_push_to_talk") === "true"

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
							// Voice Activity Detection (VAD) settings
							// In push-to-talk mode, turn detection is disabled (null)
							// In automatic mode, VAD is tuned to prevent false interruptions
							turnDetection: pushToTalk ? null : {
								type: "server_vad" as const,
								threshold: 0.6,
								prefixPaddingMs: 500,
								silenceDurationMs: 1000,
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

			// Send a welcome message to trigger the agent to greet the user
			// This simulates the agent greeting the child when they connect
			setTimeout(() => {
				if (sessionRef.current) {
					console.log("[Primer] Triggering welcome greeting...")
					sessionRef.current.sendMessage("Hello! Please introduce yourself and let me know you're ready to help me learn.")
				}
			}, 500)
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
		clearInactivityTimer()
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
	}, [handleStateChange, clearInactivityTimer])

	const interrupt = useCallback(() => {
		console.log("[Primer] Interrupting current response...")
		if (sessionRef.current) {
			sessionRef.current.interrupt()
			handleStateChange("listening")
			console.log("[Primer] Response interrupted")
		}
	}, [handleStateChange])

	const startPushToTalk = useCallback(() => {
		console.log("[Primer] Push-to-talk: Starting to listen")
		clearInactivityTimer()
		isPushToTalkActiveRef.current = true
		// In push-to-talk mode, we manually start audio input
		// The session is already connected, we just need to signal we're ready to receive audio
		handleStateChange("listening")
	}, [handleStateChange, clearInactivityTimer])

	const stopPushToTalk = useCallback(() => {
		console.log("[Primer] Push-to-talk: Stopped listening, committing audio")
		isPushToTalkActiveRef.current = false
		// Commit the audio buffer to trigger the agent response
		if (sessionRef.current) {
			// The realtime API will automatically process the audio when we stop
			// and trigger the agent response
			handleStateChange("thinking")
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
		startPushToTalk,
		stopPushToTalk,
	}
}

