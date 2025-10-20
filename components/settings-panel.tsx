"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Save } from "lucide-react"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApiKeyChange?: (hasKey: boolean) => void
}

const DEFAULT_PROMPT = `You are Primer, a magical learning companion for children inspired by "The Young Lady's Illustrated Primer" from Neal Stephenson's Diamond Age. 

Your role is to:
- Be warm, encouraging, and patient
- Explain concepts in age-appropriate ways
- Ask thoughtful questions to encourage curiosity
- Celebrate learning and discovery
- Keep conversations safe and educational
- Use storytelling to make learning engaging

Always maintain a friendly, supportive tone and adapt your explanations to the child's level of understanding.`

export function SettingsPanel({ open, onOpenChange, onApiKeyChange }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState("")
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT)
  const [saved, setSaved] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("primer_api_key")
    const savedPrompt = localStorage.getItem("primer_system_prompt")

    if (savedApiKey) setApiKey(savedApiKey)
    if (savedPrompt) setSystemPrompt(savedPrompt)

    if (onApiKeyChange) {
      onApiKeyChange(Boolean(savedApiKey))
    }
  }, [onApiKeyChange])

  const handleSave = () => {
    const trimmedKey = apiKey.trim()

    if (trimmedKey) {
      localStorage.setItem("primer_api_key", trimmedKey)
    } else {
      localStorage.removeItem("primer_api_key")
    }
    localStorage.setItem("primer_system_prompt", systemPrompt)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)

    if (onApiKeyChange) {
      onApiKeyChange(Boolean(trimmedKey))
    }
  }

  const handleReset = () => {
    setSystemPrompt(DEFAULT_PROMPT)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">Parent Settings</SheetTitle>
          <SheetDescription>Configure Primer's behavior and connection settings</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <Label htmlFor="api-key" className="text-base font-semibold">
              OpenAI API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your API key is stored locally in your browser and never sent to our servers. When you connect, it's
                exchanged for a short-lived ephemeral key for secure WebRTC communication. Get your key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  OpenAI's platform
                </a>
                .
              </AlertDescription>
            </Alert>
          </div>

          {/* System Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="system-prompt" className="text-base font-semibold">
                System Prompt
              </Label>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                Reset to Default
              </Button>
            </div>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={12}
              className="font-mono text-sm resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Customize how Primer interacts with your child. This prompt guides the AI's personality and behavior.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </Button>

            {saved && (
              <p className="mt-3 text-sm text-center text-primary font-medium">✓ Settings saved successfully!</p>
            )}
          </div>

          {/* Additional Info */}
          <Alert className="bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Note:</strong> Changes take effect the next time you start a conversation with Primer.
            </AlertDescription>
          </Alert>
        </div>
      </SheetContent>
    </Sheet>
  )
}
