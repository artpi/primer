"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { KeyRound, Rocket, Settings, ShieldCheck, Sparkles } from "lucide-react"

import { PrimerOrb } from "@/components/primer-orb"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"

interface LandingContentProps {
  onGetStarted: () => void
}

function LandingContent({ onGetStarted }: LandingContentProps) {
  const howItems = [
    "Create nightly storytime adventures personalized to your child's interests.",
    "Review homework concepts in plain language and encourage curiosity with follow-up questions.",
    "Spark deeper conversations about science, art, and big feelings in a calm, supportive tone.",
  ]

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col justify-center px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-16">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Open source · Realtime AI · Built for families
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Open Primer and
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {" "}
                Learn
              </span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Primer is an open-source companion that uses OpenAI's Realtime API to help your child explore ideas through warm,
              conversational guidance—while you stay in complete control of the experience. Give your child their own
              personalized learning experience without sharing your OpenAI account.
            </p>
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
              <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-lg" onClick={onGetStarted}>
                Begin setup
              </Button>
              <p className="text-sm text-muted-foreground md:text-left">
                Set your family's OpenAI key to unlock the orb experience and personalize Primer's voice and tone.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 bg-card/70 p-8 shadow-2xl backdrop-blur">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Why Primer?</h3>
                  <p className="text-sm text-muted-foreground">
                    We believe AI should feel like a thoughtful mentor—not a toy. Primer focuses on curiosity, safety, and deep
                    learning moments. Built by a team that includes parents and trained developmental psychology specialists.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Private by design</h3>
                  <p className="text-sm text-muted-foreground">
                    Nobody will read your child's data. Keys stay in your browser, and conversations remain entirely yours. We
                    don't have servers to store your data—we literally can't access it even if we wanted to.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Made to iterate</h3>
                  <p className="text-sm text-muted-foreground">
                    No VC funding. No salaries. Just full transparency through open source. You can audit every line, customize
                    the prompt, and trust that we cannot leak your data even if we wanted to—there's nothing to leak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 rounded-3xl border border-border/40 bg-card/70 p-8 shadow-xl backdrop-blur md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How families use Primer</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {howItems.map((item) => (
                <li key={item} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold">Connect your OpenAI account</h2>
            <ol className="space-y-5 text-sm text-muted-foreground">
              <li className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">1</span>
                <div className="pt-1">
                  Visit
                  {" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground underline decoration-primary/60 decoration-2 underline-offset-4"
                  >
                    OpenAI's dashboard
                  </a>{" "}
                  and create a dedicated project for Primer.
                </div>
              </li>
              <li className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary">2</span>
                <div className="pt-1">Create a new API key scoped to Realtime access. Keep it separate from production workloads for easy rotation.</div>
              </li>
              <li className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">3</span>
                <div className="pt-1">Store the key in Primer's settings and keep a secure copy in your password manager for safe keeping.</div>
              </li>
            </ol>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
              <KeyRound className="h-5 w-5 text-primary" />
              <p>Rotate keys regularly, monitor usage in the OpenAI dashboard, and revoke unused credentials to stay secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrimerPage() {
  const orb = useTranslations("orb")
  const settings = useTranslations("settings")
  const [showSettings, setShowSettings] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)

  useEffect(() => {
    const storedKey = localStorage.getItem("primer_api_key")
    setHasApiKey(Boolean(storedKey))

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "primer_api_key") {
        setHasApiKey(Boolean(event.newValue))
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const handleGetStarted = () => {
    setShowSettings(true)
  }

  const handleApiKeyChange = useCallback((value: boolean) => {
    setHasApiKey(value)
    if (value) {
      setShowSettings(false)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* AI generated background */}
      <div
        className={`fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-700 pointer-events-none ${backgroundImage ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none" }}
      />

      {/* Magical gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

      {/* Decorative sparkles */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
          <span className="sr-only">{settings("openButton")}</span>
        </Button>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col">
        {hasApiKey ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="mb-12 space-y-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Primer
              </h1>
              <p className="mx-auto max-w-md text-balance text-lg md:text-xl text-muted-foreground">
                {orb("tagline")}
              </p>
            </div>

            <PrimerOrb onBackgroundImageChange={setBackgroundImage} />

            <div className="mt-12 max-w-sm text-center text-sm text-muted-foreground">
              <p className="text-balance">{orb("hint")}</p>
            </div>
          </div>
        ) : hasApiKey === null ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">{orb("loading")}</p>
          </div>
        ) : (
          <LandingContent onGetStarted={handleGetStarted} />
        )}
      </main>

      {/* Settings panel */}
      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} onApiKeyChange={handleApiKeyChange} />
    </div>
  )
}
