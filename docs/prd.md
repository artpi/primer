# PRD: Primer

## 1. Product overview
### 1.1 Document title
   - PRD: Primer
   - Tagline for the product: An AI companion for curious kids.
   - Slug for the product: primer

### 1.2 Product summary
   - Primer is a standalone, open-source, voice-first web application designed to provide children with a safe and engaging way to interact with artificial intelligence. Inspired by the "Young Lady's Illustrated Primer" from Neal Stephenson's novel *The Diamond Age*, this app aims to be an interactive friend and tutor for kids.
   - The application has no backend and stores no user data, ensuring maximum privacy and compliance with regulations like COPPA. Parents provide their own OpenAI API key, which is stored locally in the browser's `localStorage`.
   - The interface is simple and inviting: a large button to start a voice conversation. The AI, powered by OpenAI's real-time API, is designed to be a patient and knowledgeable companion. Parents can customize the AI's instructions to create a tailored experience for their child.
   - The long-term vision for Primer is to evolve into a comprehensive learning tool with community-driven features like AI-generated imagery, structured learning curriculums, and connections to external data sources.

### 1.3 Elevator pitch
   - Primer is a safe, open-source, voice-based AI friend for children that runs entirely in the browser. Parents use their own OpenAI API key to power the experience, ensuring complete data privacy and control. It's a personal, interactive encyclopedia that kids can talk to, configured and managed by their parents.

## 2. Goals
### 2.1 Project goals
   - Provide a secure and private AI interaction space for children, fully compliant with COPPA by not storing or transmitting any personal data.
   - Empower parents with a free, open-source tool that they can control and customize for their children's education and entertainment.
   - Foster a community of developers and parents to extend the application's capabilities with new learning modules and features.
### 2.2 User goals
   - (For Children): Have a fun, engaging, and non-judgmental "friend" to talk to and ask endless questions.
   - (For Children): Learn about new things in an interactive way.
   - (For Parents): Provide their children with a safe digital experience without creating accounts or subscriptions.
   - (For Parents): Have full control and transparency over their child's AI interactions by using their own API key and customizing the AI's behavior.
### 2.3 Non-goals
   - This is not a service. There will be no backend servers, user databases, or data collection.
   - The project will not be monetized through subscriptions or advertising. It will remain free and open-source.
   - The app will not store any conversation histories or personal data. All settings are stored client-side in `localStorage`.
   - It is not a replacement for human interaction or formal education.

## 3. User personas
### 3.1 Key user types
   - Child User
   - Parent (Configurator)
### 3.2 Basic persona details
   - **Child User**: A curious child (ages 6-12) who enjoys learning and asking questions. They are comfortable with technology like tablets and smartphones.
   - **Parent**: A tech-savvy parent who wants to provide safe digital tools for their child. They are concerned about online safety and data privacy and are capable of generating an OpenAI API key.

## 4. Functional requirements
   - **Settings Panel** (Priority: High)
     - Parents must be able to enter and save an OpenAI API key.
     - Parents must be able to enter and save a custom system prompt to define the AI's personality and rules.
     - All settings must be stored exclusively in the browser's `localStorage`.
   - **Voice Interaction** (Priority: High)
     - A large, single button on the screen to initiate and end a voice conversation.
     - The app must capture the user's voice, send it directly to the OpenAI API (using the parent's key), and play back the AI's audio response.
   - **Future: Image Generation** (Priority: Medium)
     - The AI could generate images based on the conversation, which are then displayed in the app.
   - **Future: Curriculums** (Priority: Low)
     - The community could develop structured learning paths or topics for the AI to guide children through.

## 5. User experience
### 5.1. Entry points & first-time user flow
   - A parent discovers the Primer web application (e.g., on GitHub Pages).
   - On first use, the app prompts the parent to configure it. The parent navigates to a settings panel.
   - The parent enters their OpenAI API key and optionally customizes the AI's system prompt. They save the settings.
   - The app is now ready. The child sees the main interface with the large button and can start their conversation.
### 5.2. Core experience
   - **Initiate Conversation**: The child presses the large button on the screen. The button might animate or provide auditory feedback to indicate it's listening.
   - **Speak and Listen**: The child asks a question. The app provides a visual indicator that it's processing. The AI's voice response is clear and easy to understand.
   - **End Conversation**: The child can end the conversation by pressing the button again.
### 5.3. Advanced features & edge cases
   - The system needs to handle background noise or unclear speech gracefully.
   - If the AI doesn't understand, it should ask for clarification in a friendly way.
   - The UI should handle different states: idle, listening, processing, and speaking.
   - The UI should clearly indicate if the OpenAI API key is missing or invalid.
### 5.4. UI/UX highlights
   - Minimalist and friendly UI, focused entirely on the conversation.
   - The "big button" is the central, unambiguous element of the interface.
   - A simple, non-intrusive settings panel for parents.

## 6. Narrative
A parent, Alex, is looking for a way to nurture their 8-year-old child's curiosity. The child asks a lot of questions, and Alex wants to provide a safe way for them to explore answers with AI without signing up for a service or compromising their privacy. Alex discovers the open-source Primer project. They open the web app, navigate to the settings, and paste in their own OpenAI API key. They also add a custom instruction for the AI: "You are a friendly pirate who loves to answer questions about science and history." Alex then hands the tablet to their child, who is thrilled to have a "pirate robot friend" to talk to. They press the big button and start asking about everything from dinosaurs to black holes, and the AI responds with patience and a fun pirate accent.

## 7. Project Success
Since Primer is a privacy-focused, standalone application, success cannot be measured with traditional user metrics. Instead, it will be measured by:
   - **Community Engagement**: GitHub stars, forks, and contributions (e.g., new features, bug fixes, curriculum ideas).
   - **Public Feedback**: Positive reviews and testimonials from parents on blogs, social media, and forums.
   - **Adoption**: The number of independent deployments or instances being used.

## 8. Technical considerations
### 8.1. Tech Stack
   - **Framework**: Next.js (exported to a static SPA).
   - **Deployment**: GitHub Pages or any static web host.
### 8.2. Integration points
   - OpenAI API for speech-to-text, text-to-speech, and language model responses (client-side only).
### 8.3. Data storage & privacy
   - This is a paramount concern. The application is designed to be fully COPPA compliant.
   - **No data is ever stored on a server.**
   - The OpenAI API key and any custom prompts are stored exclusively in the browser's `localStorage`. They are not transmitted anywhere except to OpenAI during an active conversation.
   - No conversation history, logs, or user analytics are stored or collected.
### 8.4. Potential challenges
   - **API Key Security**: Educating parents on the importance of securing their OpenAI API key and the potential costs associated with its use. The application should not expose the key in the UI after it has been saved.
   - **Latency**: Real-time voice interaction requires low latency. Performance will depend on the user's connection and the OpenAI API's responsiveness.
   - **Transcription Accuracy**: Accurately transcribing children's speech can be challenging.

## 9. Milestones & sequencing
### 9.1. Phases
   - **Phase 1 (MVP)**:
     - Key deliverables: A simple UI with a button to trigger voice chat, integration with OpenAI's APIs, and a settings panel to store the API key and a custom system prompt in `localStorage`.
     - Localization note: Only the orb experience and settings panel are translated; the public landing page remains English-only for the initial release.
   - **Future Phases (Community Driven)**:
     - Key deliverables: Image generation features, development of guided "curriculums," and integrations with other external data sources. The settings could be enhanced to be stored and managed via import/export or linked to a user's OpenAI account resources (e.g., Assistants).

## 10. User stories
### 10.1. Parent Configures the App
   - **ID**: US-001
   - **Description**: As a parent, I want to access a settings panel to configure the application with my own OpenAI API key and a custom set of instructions for the AI.
   - **Acceptance criteria**:
     - A settings panel is accessible from the main UI.
     - The panel has input fields for an OpenAI API key and a custom system prompt.
     - Saving the settings stores them in the browser's `localStorage`.
     - The app uses these settings for all subsequent API calls to OpenAI.
     - A clear message is shown if the API key is not configured.
### 10.2. Start Voice Conversation
   - **ID**: US-002
   - **Description**: As a child, I want to press a big button to start talking to the AI.
   - **Acceptance criteria**:
     - A large, prominent button is visible in the center of the screen.
     - Pressing the button activates the microphone and starts the listening state (if the app is configured).
     - The UI changes to indicate that the app is listening.
### 10.3. Talk to AI
   - **ID**: US-003
   - **Description**: As a child, I want to ask a question and hear the AI's answer.
   - **Acceptance criteria**:
     - The app captures audio from the microphone.
     - The audio is sent to OpenAI for processing (STT -> Chat -> TTS).
     - The generated audio response is played back to the child.
     - The system handles a continuous back-and-forth conversation.
