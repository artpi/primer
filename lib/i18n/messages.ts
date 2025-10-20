import { isLocale, locales, type Locale } from "./config"

type MessagesByNamespace = Record<string, unknown>

const modules = import.meta.glob("../../messages/**/*.json", { eager: true }) as Record<
  string,
  { default: MessagesByNamespace }
>

const localeMessages = Object.fromEntries(locales.map((locale) => [locale, {}])) as Record<
  Locale,
  MessagesByNamespace
>

for (const [path, module] of Object.entries(modules)) {
  const match = path.match(/\.\.\/\.\.\/messages\/([^/]+)\/([a-z-]+)\.json$/i)

  if (!match) {
    continue
  }

  const [, namespace, locale] = match

  if (!isLocale(locale)) {
    continue
  }

  localeMessages[locale][namespace] = module.default
}

export { localeMessages }
