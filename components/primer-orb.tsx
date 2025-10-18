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

    // Helper function to calculate radius variation for cloud-like effect
    const calculateRadiusVariation = (state: OrbState, t: number, index: number, offset: number): number => {
      if (state === "listening") {
        return Math.sin(t * 2 + index * 0.1 + offset) * 8 +
               Math.sin(t * 3 + index * 0.05 + offset * 2) * 4
      } else if (state === "thinking") {
        return Math.sin(t * 3 + index * 0.2 + offset) * 5 +
               Math.sin(t * 2 + index * 0.15 + offset * 1.5) * 3
      } else if (state === "speaking") {
        return Math.sin(t * 4 + index * 0.15 + offset) * 12 +
               Math.sin(t * 5 + index * 0.08 + offset * 2) * 6
      } else {
        return Math.sin(t + index * 0.05 + offset) * 3 +
               Math.sin(t * 1.5 + index * 0.03 + offset * 1.2) * 2
      }
    }

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

          // Calculate current and next point radius variations
          const radiusVariation = calculateRadiusVariation(orbState, time, i, layerOffset)
          const nextRadiusVariation = calculateRadiusVariation(orbState, time, i + 1, layerOffset)

          const radius = baseRadius + radiusVariation - layer * 10
          const nextRadius = baseRadius + nextRadiusVariation - layer * 10
          
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
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
            ctx.quadraticCurveTo(cpX, cpY, nextX, nextY)
          }
        }

        // Close path smoothly to first point with final curve
        const lastAngle = ((points - 1) / points) * Math.PI * 2
        const firstAngle = 0
        const lastRadiusVariation = calculateRadiusVariation(orbState, time, points - 1, layerOffset)
        const firstRadiusVariation = calculateRadiusVariation(orbState, time, 0, layerOffset)
        const lastRadius = baseRadius + lastRadiusVariation - layer * 10
        const firstRadius = baseRadius + firstRadiusVariation - layer * 10
        
        const cpAngle = (lastAngle + firstAngle + Math.PI * 2) / 2
        const cpRadius = (lastRadius + firstRadius) / 2
        const cpX = centerX + Math.cos(cpAngle) * cpRadius
        const cpY = centerY + Math.sin(cpAngle) * cpRadius
        
        ctx.quadraticCurveTo(cpX, cpY, firstX, firstY)

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
