"use client"

import { useEffect, useRef } from "react"

export function GradientBackground({
  className = "",
  colors = ["#c87533", "#d4a76a", "#b36a3e", "#e6b17e", "#8c5a32"],
  speed = 10,
}: {
  className?: string
  colors?: string[]
  speed?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create gradient points
    const points = colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed * 0.1,
      vy: (Math.random() - 0.5) * speed * 0.1,
      color,
    }))

    const animate = () => {
      // Create gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8,
      )

      // Update points
      points.forEach((point, i) => {
        // Move point
        point.x += point.vx
        point.y += point.vy

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1

        // Add color stop
        gradient.addColorStop(i / (points.length - 1), point.color + "40")
      })

      // Fill background
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [colors, speed])

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-20 ${className}`} />
}
