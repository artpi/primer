import { type Locale } from "./config"

import orbEn from "@/messages/orb/en.json"
import orbPl from "@/messages/orb/pl.json"
import settingsEn from "@/messages/settings/en.json"
import settingsPl from "@/messages/settings/pl.json"

type NamespaceMessages = Record<string, unknown>

type LocaleMessages = Record<Locale, Record<string, NamespaceMessages>>

const localeMessages: LocaleMessages = {
  en: {
    orb: orbEn,
    settings: settingsEn,
  },
  pl: {
    orb: orbPl,
    settings: settingsPl,
  },
}

export { localeMessages }
