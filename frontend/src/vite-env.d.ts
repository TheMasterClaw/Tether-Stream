/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYMENT_STREAM_ADDRESS: string
  readonly VITE_BILLING_REGISTRY_ADDRESS: string
  readonly VITE_USDT_ADDRESS: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_BASE_SEPOLIA_RPC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}