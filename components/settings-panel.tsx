"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Info, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/language-provider"
import { locales, type Locale, isLocale } from "@/lib/i18n/config"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApiKeyChange?: (hasKey: boolean) => void
}

export function SettingsPanel({ open, onOpenChange, onApiKeyChange }: SettingsPanelProps) {
  const t = useTranslations("settings")
  const { locale, setLocale } = useLanguage()
  const defaultPrompt = t("prompt.default")

  const [apiKey, setApiKey] = useState("")
  const [systemPrompt, setSystemPrompt] = useState(defaultPrompt)
  const [saved, setSaved] = useState(false)
  const [autoDetectedLocale, setAutoDetectedLocale] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("primer_system_prompt")) {
      setSystemPrompt(defaultPrompt)
    }
  }, [defaultPrompt])

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

  useEffect(() => {
    if (!open || autoDetectedLocale) {
      return
    }

    const storedLocale = localStorage.getItem("primer_language")
    if (!storedLocale) {
      const [preferred] = navigator.languages ?? [navigator.language]
      const normalized = preferred?.split("-")[0]

      if (isLocale(normalized) && normalized !== locale) {
        setLocale(normalized)
      }
    }

    setAutoDetectedLocale(true)
  }, [autoDetectedLocale, locale, open, setLocale])

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
    setSystemPrompt(defaultPrompt)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <Label htmlFor="language" className="text-base font-semibold">
              {t("language.label")}
            </Label>
            <select
              id="language"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {locales.map((code) => (
                <option key={code} value={code}>
                  {t(`language.options.${code}` as const)}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground">{t("language.description")}</p>
          </div>

          {/* API Key Section */}
          <div className="space-y-3">
            <Label htmlFor="api-key" className="text-base font-semibold">
              {t("apiKey.label")}
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
                {t.rich("apiKey.hint", {
                  link: (chunks) => (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </AlertDescription>
            </Alert>
          </div>

          {/* System Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="system-prompt" className="text-base font-semibold">
                {t("prompt.label")}
              </Label>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                {t("prompt.reset")}
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
              {t("prompt.description")}
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="mr-2 h-5 w-5" />
              {t("actions.save")}
            </Button>

            {saved && (
              <p className="mt-3 text-sm text-center text-primary font-medium">{t("actions.saved")}</p>
            )}
          </div>

          {/* Additional Info */}
          <Alert className="bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {t.rich("notes.content", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </AlertDescription>
          </Alert>
        </div>
      </SheetContent>
    </Sheet>
  )
}
