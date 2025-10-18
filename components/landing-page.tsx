"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Key, Shield, Sparkles, ArrowRight, ExternalLink } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
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

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-12">
          {/* Hero section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Inspired by "The Young Lady's Illustrated Primer"
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Welcome to Primer
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto">
              A magical AI learning companion designed to nurture your child's curiosity and love for learning
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Learning</h3>
              <p className="text-sm text-muted-foreground">
                Engaging voice conversations that adapt to your child's interests and learning pace
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized Experience</h3>
              <p className="text-sm text-muted-foreground">
                Customizable AI personality and teaching style to match your family's values
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safe & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your API key stays in your browser. No data stored on our servers. Complete privacy.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border space-y-6">
            <h2 className="text-2xl font-bold text-center">How to Get Started</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Get Your OpenAI API Key</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Visit{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      OpenAI's platform
                      <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    to create your API key. You'll need to sign up for an OpenAI account and add billing information.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Set Up Your API Key</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Get Started" below and enter your API key in the settings. It's stored locally in your
                    browser—we never see it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Start Learning!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your child can begin chatting with Primer immediately. The AI will adapt to their interests and
                    learning style.
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-accent/10 border-accent/30">
              <Key className="h-4 w-4 text-accent-foreground" />
              <AlertDescription className="text-sm">
                <strong className="font-semibold">Best Practice:</strong> Create a separate OpenAI project just for
                Primer. This lets you track usage separately and set spending limits to control costs. You can set
                monthly limits in your OpenAI dashboard to prevent unexpected charges.
              </AlertDescription>
            </Alert>
          </div>

          {/* Privacy note */}
          <Alert className="border-primary/30 bg-primary/5">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong className="font-semibold">Privacy First:</strong> Primer runs entirely in your browser. Your API
              key and conversations are never sent to our servers. You have complete control over your data. The OpenAI
              Realtime API uses short-lived ephemeral keys for secure WebRTC connections.
            </AlertDescription>
          </Alert>

          {/* CTA */}
          <div className="flex justify-center">
            <Button onClick={onGetStarted} size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-muted-foreground">
            Estimated cost: ~$0.10-0.30 per hour of conversation with your child
          </p>
        </div>
      </main>
    </div>
  )
}
