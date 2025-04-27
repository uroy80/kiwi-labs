import type React from "react"
import "@/app/globals.css"
import { Playfair_Display, Raleway } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"
import { ParticlesBackground } from "@/components/particles-background"
import { GradientBackground } from "@/components/gradient-background"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-raleway",
})

export const metadata = {
  title: "Kiwi Labs - Mock Interview App",
  description: "Practice for your next job interview with realistic questions and feedback from Kiwi Labs",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${raleway.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed inset-0 -z-20 overflow-hidden">
            <GradientBackground />
            <ParticlesBackground />
          </div>
          <main className="min-h-screen bg-background/80 backdrop-blur-sm flex flex-col relative">
            <div className="flex-grow">{children}</div>
            <Footer />
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
