"use client"

import { useCallback } from "react"
import type { ReactNode } from "react"
import { toast as toastManager } from "@/components/ui/toast"

type ToastOptions = {
  title?: ReactNode
  description?: ReactNode
  variant?: "default" | "destructive"
  timeout?: number
}

export function useToast() {
  const toast = useCallback(({ variant = "default", ...options }: ToastOptions) => {
    return toastManager.add({
      ...options,
      type: variant === "destructive" ? "error" : "success",
      priority: variant === "destructive" ? "high" : "low",
    })
  }, [])

  return { toast }
}
