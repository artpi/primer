import type { RealtimeSession, TransportToolCallEvent } from "@openai/agents-realtime"

const BACKGROUND_IMAGE_TOOL_NAME = "generate_background_image" as const

export const BACKGROUND_IMAGE_TOOL_DEFINITION = {
	type: "function" as const,
	name: BACKGROUND_IMAGE_TOOL_NAME,
	description:
		"Generate an image using DALL-E/gpt-image-1. ALWAYS use this tool when the user asks you to generate, create, draw, make, or show them an image, picture, illustration, or drawing of anything. The generated image will be displayed as the background of the interface. You CAN generate images - use this tool to do so!",
        parameters: {
                type: "object" as const,
                properties: {
                        prompt: {
                                type: "string" as const,
                                description:
                                        "Detailed description of the background to create. Mention characters, settings, colours, or moods that should appear in the scene.",
                        },
                        style: {
                                type: "string" as const,
                                description:
                                        "Optional art direction or stylistic guidance, such as 'watercolour', 'paper cut-out', or 'soft gradients'.",
                        },
                },
                required: ["prompt"],
                additionalProperties: false,
        },
        // Note: required by @openai/agents-realtime tool definition types, but NOT accepted by
        // the Realtime GA HTTP API when included in `session.tools`. Strip it before sending.
        strict: false,
}

type Translator = (key: string) => string

type BackgroundImageToolCall = TransportToolCallEvent & { arguments?: string }

interface BackgroundImageToolOptions {
        session: RealtimeSession
        toolCall: BackgroundImageToolCall
        translate: Translator
        onBackgroundImageChange?: (imageUrl: string | null) => void
}

export type BackgroundImageToolArgs = {
        prompt: string
        style?: string
}

export type BackgroundImageToolResult =
        | {
                        status: "success"
                        size: ViewportSizing["size"]
                        orientation: ViewportSizing["orientation"]
                        aspectRatio: number
                        promptUsed: string
                        imageUrl: string
          }
        | {
                        status: "error"
                        message: string
          }

interface ViewportSizing {
        width: number
        height: number
        ratio: number
        // Supported by the Images API (gpt-image-1) as of GA:
        // "1024x1024", "1024x1536", "1536x1024", "auto"
        size: "1536x1024" | "1024x1536" | "1024x1024"
        orientation: "landscape" | "portrait" | "square"
}

const computeViewportSizing = (): ViewportSizing => {
        if (typeof window === "undefined") {
                return {
                        width: 1024,
                        height: 1024,
                        ratio: 1,
                        size: "1024x1024",
                        orientation: "square",
                }
        }

        const width = Math.max(window.innerWidth, 1)
        const height = Math.max(window.innerHeight, 1)
        const ratio = width / height

        if (ratio >= 1.2) {
                return {
                        width,
                        height,
                        ratio,
                        size: "1536x1024",
                        orientation: "landscape",
                }
        }

        if (ratio <= 0.8) {
                return {
                        width,
                        height,
                        ratio,
                        size: "1024x1536",
                        orientation: "portrait",
                }
        }

        return {
                width,
                height,
                ratio,
                size: "1024x1024",
                orientation: "square",
        }
}

const parseToolArguments = (rawArguments: string | undefined): Record<string, unknown> => {
        if (!rawArguments) {
                return {}
        }

        try {
                const maybeJson = JSON.parse(rawArguments)
                if (maybeJson && typeof maybeJson === "object") {
                        return maybeJson as Record<string, unknown>
                }
        }
        catch (error) {
                console.warn(
                        "[Primer] Failed to parse tool arguments as JSON, treating as prompt string",
                        error,
                )
                return { prompt: rawArguments }
        }

        return {}
}

const buildPrompt = (
        translate: Translator,
        parsedArguments: Record<string, unknown>,
        viewport: ViewportSizing,
): string => {
        const promptFromAgent = typeof parsedArguments.prompt === "string" ? parsedArguments.prompt.trim() : ""
        const styleHint = typeof parsedArguments.style === "string" ? parsedArguments.style.trim() : ""
        const defaultPrompt = translate("background.defaultPrompt")

        const promptSections = [promptFromAgent.length > 0 ? promptFromAgent : defaultPrompt]

        if (styleHint.length > 0) {
                promptSections.push(`Style preference: ${styleHint}`)
        }

        promptSections.push(
                "Create a family-friendly, gentle scene that works as a subtle interface background without overwhelming the content.",
        )

        promptSections.push(
                `Match an ${viewport.orientation} layout with an aspect ratio close to ${viewport.ratio.toFixed(2)}:1 to avoid stretching.`,
        )

        return promptSections.join("\n\n")
}

export const generateBackgroundImage = async ({
        translate,
        args,
        onBackgroundImageChange,
}: {
        translate: Translator
        args: Record<string, unknown>
        onBackgroundImageChange?: (imageUrl: string | null) => void
}): Promise<BackgroundImageToolResult> => {
        const apiKey = localStorage.getItem("primer_api_key")
        if (!apiKey) {
                const message = translate("errors.apiKeyMissing")
                alert(message)
                onBackgroundImageChange?.(null)
                return { status: "error", message: "Missing API key" }
        }

        const viewport = computeViewportSizing()
        const finalPrompt = buildPrompt(translate, args, viewport)

        try {
                console.log("[Primer] Generating background image with gpt-image-1", {
                        size: viewport.size,
                        orientation: viewport.orientation,
                        ratio: viewport.ratio,
                        prompt: finalPrompt,
                })

                const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
                        method: "POST",
                        headers: {
                                Authorization: `Bearer ${apiKey}`,
                                "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                                model: "gpt-image-1",
                                prompt: finalPrompt,
                                size: viewport.size,
                        }),
                })

                if (!imageResponse.ok) {
                        const errorText = await imageResponse.text()
                        throw new Error(`Image generation failed: ${imageResponse.status} ${errorText}`)
                }

                const imageJson = await imageResponse.json()
                const firstImage = imageJson?.data?.[0] as
                        | { b64_json?: string; b64?: string; base64?: string; url?: string }
                        | undefined
                const base64Image = firstImage?.b64_json ?? firstImage?.b64 ?? firstImage?.base64
                const urlImage = firstImage?.url

                const imageUrl =
                        typeof base64Image === "string" && base64Image.length > 0
                                ? `data:image/png;base64,${base64Image}`
                                : typeof urlImage === "string" && urlImage.length > 0
                                        ? urlImage
                                        : null

                if (!imageUrl) {
                        throw new Error("Image generation response did not include image data")
                }
                onBackgroundImageChange?.(imageUrl)

                return {
                        status: "success",
                        imageUrl,
                        size: viewport.size,
                        orientation: viewport.orientation,
                        aspectRatio: Number(viewport.ratio.toFixed(2)),
                        promptUsed: finalPrompt,
                }
        }
        catch (error) {
                console.error("[Primer] Failed to generate background image", error)
                onBackgroundImageChange?.(null)
                const message =
                        error instanceof Error
                                ? error.message
                                : "Unknown error while generating background image"
                return { status: "error", message }
        }
}

export const runBackgroundImageTool = async ({
        session,
        toolCall,
        translate,
        onBackgroundImageChange,
}: BackgroundImageToolOptions): Promise<void> => {
        const parsedArguments = parseToolArguments(toolCall.arguments)
        const result = await generateBackgroundImage({
                translate,
                args: parsedArguments,
                onBackgroundImageChange,
        })

        // Avoid sending giant base64 payloads back into the conversation.
        if (result.status === "success") {
                const { imageUrl: _imageUrl, ...rest } = result
                session.transport.sendFunctionCallOutput(toolCall, JSON.stringify(rest), true)
                return
        }

        session.transport.sendFunctionCallOutput(toolCall, JSON.stringify(result), true)
}

export const BACKGROUND_IMAGE_TOOL = {
        definition: BACKGROUND_IMAGE_TOOL_DEFINITION,
        name: BACKGROUND_IMAGE_TOOL_NAME,
        run: runBackgroundImageTool,
}

export type BackgroundImageTool = typeof BACKGROUND_IMAGE_TOOL
