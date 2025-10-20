export {}

declare global {
  interface ImportMeta {
    glob(pattern: string, options: { eager: true }): Record<string, unknown>
  }
}
