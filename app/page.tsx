"use client"

import { useState, useEffect } from "react"
import { PrimerOrb } from "@/components/primer-orb"
import { SettingsPanel } from "@/components/settings-panel"
import { LandingPage } from "@/components/landing-page"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function PrimerPage() {
  const [showSettings, setShowSettings] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [showLanding, setShowLanding] = useState(true)

  // Check for API key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem("primer_api_key")
    const hasSeenLanding = localStorage.getItem("primer_has_seen_landing")
    
    setHasApiKey(!!apiKey)
    
    // Show landing page if no API key or haven't seen landing before
    if (apiKey && hasSeenLanding === "true") {
      setShowLanding(false)
    }
  }, [])

  const handleGetStarted = () => {
    localStorage.setItem("primer_has_seen_landing", "true")
    setShowLanding(false)
    setShowSettings(true)
  }

  const handleApiKeySaved = () => {
    // Re-check if API key is now set
    const apiKey = localStorage.getItem("primer_api_key")
    setHasApiKey(!!apiKey)
  }

  // Show loading state while checking localStorage
  if (hasApiKey === null) {
    return null
  }

  // Show landing page for first-time users or when no API key
  if (showLanding && !hasApiKey) {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Magical gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

      {/* Decorative sparkles */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[10%] left-[15%] w-2 h-2 bg-accent rounded-full sparkle"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-[20%] right-[20%] w-1.5 h-1.5 bg-primary rounded-full sparkle"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-secondary rounded-full sparkle"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] right-[15%] w-1.5 h-1.5 bg-accent rounded-full sparkle"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-1 h-1 bg-primary rounded-full sparkle"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Settings button */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full shadow-lg bg-card/80 backdrop-blur-sm hover:bg-card"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Primer
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-md mx-auto">
            Your magical learning companion
          </p>
        </div>

        <PrimerOrb />

        <div className="mt-12 text-center text-sm text-muted-foreground max-w-sm">
          <p className="text-balance">Tap the orb to start a conversation with Primer</p>
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} onApiKeySaved={handleApiKeySaved} />
    </div>
  )
}
