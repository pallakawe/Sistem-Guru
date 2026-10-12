'use client'

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "sistem-guru-theme"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"))
    setMounted(true)
  }, [])

  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", nextDark)
    document.documentElement.style.colorScheme = nextDark ? "dark" : "light"
    localStorage.setItem(STORAGE_KEY, nextDark ? "dark" : "light")
    setIsDark(nextDark)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className="shrink-0 bg-card/80 backdrop-blur"
    >
      {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
