"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
}

export function ParticlesBackground({
  count = 50,
  className = "",
  colors = ["#c87533", "#d4a76a", "#b36a3e", "#e6b17e", "#8c5a32"],
  maxSize = 8,
  minSize = 2,
  maxSpeed = 0.5,
  connectParticles = true,
  connectDistance = 150,
}: {
  count?: number
  className?: string
  colors?: string[]
  maxSize?: number
  minSize?: number
  maxSpeed?: number
  connectParticles?: boolean
  connectDistance?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Initialize particles
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Create particles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * maxSpeed,
        speedY: (Math.random() - 0.5) * maxSpeed,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.1,
      })
    }
    particlesRef.current = particles
  }, [dimensions, count, colors, maxSize, minSize, maxSpeed])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x > dimensions.width || particle.x < 0) {
          particle.speedX = -particle.speedX
        }
        if (particle.y > dimensions.height || particle.y < 0) {
          particle.speedY = -particle.speedY
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle =
          particle.color +
          Math.floor(particle.opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.fill()

        // Connect particles
        if (connectParticles) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const otherParticle = particlesRef.current[j]
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < connectDistance) {
              ctx.beginPath()
              ctx.strokeStyle = `${particle.color}${Math.floor((1 - distance / connectDistance) * 40)
                .toString(16)
                .padStart(2, "0")}`
              ctx.lineWidth = 0.5
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.stroke()
            }
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [dimensions, connectParticles, connectDistance])

  return <canvas ref={canvasRef} className={`absolute inset-0 -z-10 ${className}`} style={{ opacity: 0.6 }} />
}
