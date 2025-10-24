/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_USE_SSH_GEMINI: string
  readonly VITE_SSH_GEMINI_HOST: string
  readonly VITE_SSH_GEMINI_PORT: string
  readonly VITE_SSH_GEMINI_USERNAME: string
  readonly VITE_SSH_GEMINI_PRIVATE_KEY: string
  readonly VITE_SSH_GEMINI_PASSWORD: string
  readonly VITE_SSH_GEMINI_API_ENDPOINT: string
  readonly VITE_SSH_GEMINI_TIMEOUT: string
  readonly VITE_SSH_GEMINI_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}






