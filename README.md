# Primer

**An AI companion for curious kids.**

Primer is a standalone, open-source, voice-first web application designed to provide children with a safe and engaging way to interact with artificial intelligence. Inspired by the "Young Lady's Illustrated Primer" from Neal Stephenson's novel *The Diamond Age*, this app aims to be an interactive friend and tutor for kids.

## Key Features

- **Voice-First Interface**: A simple, inviting interface with a large button to start a voice conversation.
- **Privacy by Design**: The application has no backend and stores no user data, ensuring maximum privacy and compliance with regulations like COPPA.
- **Parent Controlled**: Parents provide their own OpenAI API key, which is stored locally in the browser's `localStorage`. This means parents have full control over the API usage.
- **Customizable Experience**: Parents can customize the AI's instructions to create a tailored experience for their child.

## How It Works

Primer is a bring-your-own-key solution. Parents configure the application by adding their own OpenAI API key into a settings panel. All configuration is stored locally in the browser, and no data is ever sent to a server.

The app is built with Next.js and is designed to be deployed as a static site on platforms like GitHub Pages.

## Product Requirements Document

For a detailed breakdown of the project's vision, goals, user stories, and technical specifications, please see the [Product Requirements Document (PRD)](./docs/prd.md).

## Getting Started

* `npm install`
* `npm run dev` while developing
* `npm run check` to check types and lints.

