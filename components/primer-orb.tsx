"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRealtimeAgent } from "@/hooks/use-realtime-agent"

type OrbState = "idle" | "muted" | "listening" | "thinking" | "speaking"

export function PrimerOrb() {
  const [orbState, setOrbState] = useState<OrbState>("idle")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  const { isConnected, connect, disconnect } = useRealtimeAgent({
    onStateChange: (state) => {
      setOrbState(state)
    },
  })

  // Orb animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 300 * dpr
    canvas.height = 300 * dpr
    ctx.scale(dpr, dpr)

    const centerX = 150
    const centerY = 150
    const baseRadius = 80

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, 300, 300)

      // Draw multiple layers for depth
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 0.3
        const points = 100

        ctx.beginPath()

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2

          // Different wave patterns based on state
          let radiusVariation = 0
          if (orbState === "listening") {
            radiusVariation = Math.sin(time * 2 + i * 0.1 + layerOffset) * 8
          } else if (orbState === "thinking") {
            radiusVariation = Math.sin(time * 3 + i * 0.2 + layerOffset) * 5
          } else if (orbState === "speaking") {
            radiusVariation = Math.sin(time * 4 + i * 0.15 + layerOffset) * 12
          } else {
            radiusVariation = Math.sin(time + i * 0.05 + layerOffset) * 3
          }

          const radius = baseRadius + radiusVariation - layer * 10
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()

        // Color based on state
        let gradient
        if (orbState === "listening") {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.6)")
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.3)")
        } else if (orbState === "thinking") {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(236, 72, 153, 0.6)")
          gradient.addColorStop(1, "rgba(139, 92, 246, 0.3)")
        } else if (orbState === "speaking") {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(251, 191, 36, 0.6)")
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.3)")
        } else {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.4)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.2)")
        }

        ctx.fillStyle = gradient
        ctx.fill()

        // Add glow
        ctx.shadowBlur = 20
        ctx.shadowColor = orbState === "speaking" ? "rgba(251, 191, 36, 0.5)" : "rgba(139, 92, 246, 0.5)"
      }

      time += 0.02
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [orbState])

  const handleOrbClick = async () => {
    if (!isConnected) {
      await connect()
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setOrbState("idle")
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Orb container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            orbState === "listening"
              ? "ring-4 ring-primary/30 scale-110"
              : orbState === "thinking"
                ? "ring-4 ring-secondary/30 scale-110"
                : orbState === "speaking"
                  ? "ring-4 ring-accent/30 scale-110"
                  : "ring-2 ring-primary/10"
          }`}
        />

        {/* Canvas orb */}
        <button
          onClick={handleOrbClick}
          disabled={isConnected}
          className="relative block rounded-full overflow-hidden shadow-2xl transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:cursor-default disabled:hover:scale-100"
          aria-label={isConnected ? "Connected - speak to Primer" : "Connect to Primer"}
        >
          <canvas ref={canvasRef} width={300} height={300} className="w-[300px] h-[300px]" />
        </button>

        {/* State indicator */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-card/90 backdrop-blur-sm shadow-lg border">
          <p className="text-sm font-medium">
            {!isConnected && "Click to start"}
            {isConnected && orbState === "idle" && "Ready to chat"}
            {isConnected && orbState === "muted" && "Getting ready..."}
            {orbState === "listening" && "Listening..."}
            {orbState === "thinking" && "Thinking..."}
            {orbState === "speaking" && "Speaking..."}
          </p>
        </div>
      </div>

      {isConnected && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDisconnect}
            className="rounded-full shadow-lg bg-transparent"
          >
            End Chat
          </Button>
        </div>
      )}

      {isConnected && orbState !== "muted" && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Just start speaking! Primer is listening and will respond automatically.
        </p>
      )}
      {isConnected && orbState === "muted" && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Primer is saying hello—your microphone will open in just a moment.
        </p>
      )}
    </div>
  )
}
