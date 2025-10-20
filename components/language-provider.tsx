"use client"

import { NextIntlClientProvider } from "next-intl"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { defaultLocale, type Locale, isLocale } from "@/lib/i18n/config"
import { localeMessages } from "@/lib/i18n/messages"

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const storedLocale = localStorage.getItem("primer_language")
    if (isLocale(storedLocale)) {
      setLocaleState(storedLocale)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const handleSetLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    localStorage.setItem("primer_language", nextLocale)
  }, [])

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
    }),
    [handleSetLocale, locale],
  )

  return (
    <LanguageContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={localeMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
