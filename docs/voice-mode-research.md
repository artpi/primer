# Voice Mode Turn Detection Research

## Summary
- The OpenAI Realtime SDK defaults to semantic VAD turn detection and merges any overrides that clients provide, so we can safely tune threshold and silence durations per session.【F:node_modules/@openai/agents-realtime/dist/openaiRealtimeBase.js†L20-L44】【F:node_modules/@openai/agents-realtime/dist/openaiRealtimeBase.js†L360-L411】
- Primer now increases the VAD threshold, prefix padding, and silence duration to reduce self-interruptions that occur during quiet pauses.【F:hooks/use-realtime-agent.ts†L179-L191】
- Immediately after connecting we instruct the agent to deliver a friendly welcome phrase so children know the conversation has started.【F:hooks/use-realtime-agent.ts†L213-L221】

## Details
1. **Realtime SDK behavior**
   - `DEFAULT_OPENAI_REALTIME_SESSION_CONFIG` sets `turnDetection` to semantic VAD and defines default audio transcription and formats.【F:node_modules/@openai/agents-realtime/dist/openaiRealtimeBase.js†L20-L44】
   - `buildTurnDetectionConfig` accepts camelCase or snake_case overrides (threshold, silence duration, etc.), strips undefined values, and forwards them to the session update payload, mirroring how ChatGPT voice mode tunes VAD on the fly.【F:node_modules/@openai/agents-realtime/dist/openaiRealtimeBase.js†L360-L411】
2. **Primer adjustments**
   - We raise the VAD `threshold` to `0.65`, extend `prefixPaddingMs` to `450`, and double `silenceDurationMs` to `1200` so quiet gaps no longer prematurely close the turn.【F:hooks/use-realtime-agent.ts†L179-L191】
   - Once the realtime session connects we emit a `response.create` event with explicit welcome instructions, prompting an audible greeting without waiting for the first user utterance.【F:hooks/use-realtime-agent.ts†L213-L221】

These changes align Primer's behavior with the resilient turn-taking heuristics used in ChatGPT's voice experience while keeping configuration transparent for future tuning.
