"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRealtimeAgent } from "@/hooks/use-realtime-agent"

type OrbState = "idle" | "listening" | "thinking" | "speaking"

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

        // Store first point coordinates to ensure perfect closure
        let firstX = 0
        let firstY = 0

        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2
          const nextAngle = ((i + 1) / points) * Math.PI * 2

          // Different wave patterns based on state with multiple harmonics for cloud-like effect
          let radiusVariation = 0
          if (orbState === "listening") {
            radiusVariation = 
              Math.sin(time * 2 + i * 0.1 + layerOffset) * 8 +
              Math.sin(time * 3 + i * 0.05 + layerOffset * 2) * 4
          } else if (orbState === "thinking") {
            radiusVariation = 
              Math.sin(time * 3 + i * 0.2 + layerOffset) * 5 +
              Math.sin(time * 2 + i * 0.15 + layerOffset * 1.5) * 3
          } else if (orbState === "speaking") {
            radiusVariation = 
              Math.sin(time * 4 + i * 0.15 + layerOffset) * 12 +
              Math.sin(time * 5 + i * 0.08 + layerOffset * 2) * 6
          } else {
            radiusVariation = 
              Math.sin(time + i * 0.05 + layerOffset) * 3 +
              Math.sin(time * 1.5 + i * 0.03 + layerOffset * 1.2) * 2
          }

          const radius = baseRadius + radiusVariation - layer * 10
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius

          // Calculate next point for smooth curve
          const nextRadiusVariation = orbState === "listening" 
            ? Math.sin(time * 2 + (i + 1) * 0.1 + layerOffset) * 8 +
              Math.sin(time * 3 + (i + 1) * 0.05 + layerOffset * 2) * 4
            : orbState === "thinking"
            ? Math.sin(time * 3 + (i + 1) * 0.2 + layerOffset) * 5 +
              Math.sin(time * 2 + (i + 1) * 0.15 + layerOffset * 1.5) * 3
            : orbState === "speaking"
            ? Math.sin(time * 4 + (i + 1) * 0.15 + layerOffset) * 12 +
              Math.sin(time * 5 + (i + 1) * 0.08 + layerOffset * 2) * 6
            : Math.sin(time + (i + 1) * 0.05 + layerOffset) * 3 +
              Math.sin(time * 1.5 + (i + 1) * 0.03 + layerOffset * 1.2) * 2

          const nextRadius = baseRadius + nextRadiusVariation - layer * 10
          const nextX = centerX + Math.cos(nextAngle) * nextRadius
          const nextY = centerY + Math.sin(nextAngle) * nextRadius

          if (i === 0) {
            ctx.moveTo(x, y)
            firstX = x
            firstY = y
          } else {
            // Use quadratic curves for smoother, cloud-like appearance
            const cpAngle = (angle + nextAngle) / 2
            const cpRadius = (radius + nextRadius) / 2
            const cpX = centerX + Math.cos(cpAngle) * cpRadius
            const cpY = centerY + Math.sin(cpAngle) * cpRadius
            ctx.quadraticCurveTo(x, y, cpX, cpY)
          }
        }

        // Close path smoothly to first point
        ctx.quadraticCurveTo(
          centerX + Math.cos(Math.PI * 2) * (baseRadius + (orbState === "listening" 
            ? Math.sin(time * 2 + layerOffset) * 8 + Math.sin(time * 3 + layerOffset * 2) * 4
            : orbState === "thinking"
            ? Math.sin(time * 3 + layerOffset) * 5 + Math.sin(time * 2 + layerOffset * 1.5) * 3
            : orbState === "speaking"
            ? Math.sin(time * 4 + layerOffset) * 12 + Math.sin(time * 5 + layerOffset * 2) * 6
            : Math.sin(time + layerOffset) * 3 + Math.sin(time * 1.5 + layerOffset * 1.2) * 2) - layer * 10),
          centerY + Math.sin(Math.PI * 2) * (baseRadius + (orbState === "listening" 
            ? Math.sin(time * 2 + layerOffset) * 8 + Math.sin(time * 3 + layerOffset * 2) * 4
            : orbState === "thinking"
            ? Math.sin(time * 3 + layerOffset) * 5 + Math.sin(time * 2 + layerOffset * 1.5) * 3
            : orbState === "speaking"
            ? Math.sin(time * 4 + layerOffset) * 12 + Math.sin(time * 5 + layerOffset * 2) * 6
            : Math.sin(time + layerOffset) * 3 + Math.sin(time * 1.5 + layerOffset * 1.2) * 2) - layer * 10),
          firstX,
          firstY
        )

        ctx.closePath()

        // Color based on state with softer, more cloud-like gradients
        let gradient
        if (orbState === "listening") {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.7)")
          gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.5)")
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.2)")
        } else if (orbState === "thinking") {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(236, 72, 153, 0.7)")
          gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.5)")
          gradient.addColorStop(1, "rgba(139, 92, 246, 0.2)")
        } else if (orbState === "speaking") {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(251, 191, 36, 0.7)")
          gradient.addColorStop(0.5, "rgba(251, 146, 60, 0.5)")
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.2)")
        } else {
          gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius)
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.5)")
          gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.3)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.1)")
        }

        ctx.fillStyle = gradient
        ctx.fill()

        // Add softer, more diffuse glow for cloud-like effect
        ctx.shadowBlur = 30
        ctx.shadowColor = orbState === "speaking" ? "rgba(251, 191, 36, 0.4)" : "rgba(139, 92, 246, 0.4)"
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

      {isConnected && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Just start speaking! Primer is listening and will respond automatically.
        </p>
      )}
    </div>
  )
}
