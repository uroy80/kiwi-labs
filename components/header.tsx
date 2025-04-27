"use client"

import Link from "next/link"
import { KiwiLogo } from "./kiwi-logo"
import { Button } from "@/components/ui/button"
import { Home, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Header() {
  const { setTheme, resolvedTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className="relative border-b backdrop-blur-md sticky top-0 z-50 overflow-hidden">
      {/* Copper gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>

      {/* Subtle copper pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23c87533' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Subtle bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"></div>

      <div className="container mx-auto px-4 py-3 flex justify-between items-center relative">
        <Link href="/" className="flex items-center gap-2 group">
          <KiwiLogo />
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
              <Home className="h-4 w-4 mr-2 text-primary" />
              Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors"
            onClick={toggleTheme}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
