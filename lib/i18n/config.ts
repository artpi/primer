export const locales = ["en", "pl"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

const localeSet = new Set<Locale>(locales)

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) {
    return false
  }

  return localeSet.has(value as Locale)
}

