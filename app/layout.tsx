import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

import { LanguageProvider } from "@/components/language-provider"

export const metadata: Metadata = {
  title: "Primer - Your Magical Learning Companion",
  description:
    "A voice-powered AI learning companion for children, inspired by The Young Lady's Illustrated Primer",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
