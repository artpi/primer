import type React from "react"
import Script from "next/script"
import type { Metadata } from "next"
import "./globals.css"

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
      <head>
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "9cc98ed71ee24b8a96d3f64577057235"}'
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
