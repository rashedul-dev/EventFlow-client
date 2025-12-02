"use client"

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

// Custom styled toaster with brand colors
export function BrandedToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0a0a0a",
          border: "1px solid #253900",
          color: "#EEEEEE",
        },
        className: "!bg-background !border-secondary/50 !text-foreground",
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-primary" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
        loading: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
      }}
    />
  )
}

// Branded toast helpers
export const brandedToast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      style: {
        background: "#0a0a0a",
        border: "1px solid #08CB00",
        color: "#EEEEEE",
      },
    })
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      style: {
        background: "#0a0a0a",
        border: "1px solid #ef4444",
        color: "#EEEEEE",
      },
    })
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      style: {
        background: "#0a0a0a",
        border: "1px solid #eab308",
        color: "#EEEEEE",
      },
    })
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      style: {
        background: "#0a0a0a",
        border: "1px solid #3b82f6",
        color: "#EEEEEE",
      },
    })
  },
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      style: {
        background: "#0a0a0a",
        border: "1px solid #253900",
        color: "#EEEEEE",
      },
    })
  },
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id)
  },
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      style: {
        background: "#0a0a0a",
        border: "1px solid #253900",
        color: "#EEEEEE",
      },
    })
  },
}

export { sonnerToast as toast }
