"use client"

import { useEffect, useRef } from "react"

export function AtomOrbital({
  className = "",
  size = 300,
  color = "#c87533",
  speed = 10,
  electronCount = 3,
  electronSize = 4,
  orbitWidth = 1,
}: {
  className?: string
  size?: number
  color?: string
  speed?: number
  electronCount?: number
  electronSize?: number
  orbitWidth?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const orbitRadius = size / 3

    // Create electrons with different starting positions
    const electrons = Array.from({ length: electronCount }, (_, i) => ({
      angle: ((Math.PI * 2) / electronCount) * i,
      orbitTilt: (Math.random() * Math.PI) / 4, // Random tilt
      orbitRotation: Math.random() * Math.PI * 2, // Random rotation
    }))

    const animate = () => {
      ctx.clearRect(0, 0, size, size)

      // Draw nucleus
      ctx.beginPath()
      ctx.arc(centerX, centerY, size / 20, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Draw orbits (3 elliptical orbits at different angles)
      for (let i = 0; i < 3; i++) {
        const angle = ((Math.PI * 2) / 3) * i

        ctx.beginPath()
        ctx.ellipse(centerX, centerY, orbitRadius, orbitRadius * 0.6, angle, 0, Math.PI * 2)
        ctx.strokeStyle = `${color}40` // Semi-transparent
        ctx.lineWidth = orbitWidth
        ctx.stroke()
      }

      // Update and draw electrons
      electrons.forEach((electron, i) => {
        // Update angle
        electron.angle += speed * 0.001

        // Calculate position on tilted orbit
        const orbitIndex = i % 3
        const orbitAngle = ((Math.PI * 2) / 3) * orbitIndex

        const x =
          centerX +
          Math.cos(electron.angle) * orbitRadius * Math.cos(orbitAngle) -
          Math.sin(electron.angle) * orbitRadius * 0.6 * Math.sin(orbitAngle)
        const y =
          centerY +
          Math.cos(electron.angle) * orbitRadius * Math.sin(orbitAngle) +
          Math.sin(electron.angle) * orbitRadius * 0.6 * Math.cos(orbitAngle)

        // Draw electron
        ctx.beginPath()
        ctx.arc(x, y, electronSize, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Draw glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, electronSize * 3)
        gradient.addColorStop(0, `${color}80`)
        gradient.addColorStop(1, `${color}00`)

        ctx.beginPath()
        ctx.arc(x, y, electronSize * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, color, speed, electronCount, electronSize, orbitWidth])

  return <canvas ref={canvasRef} width={size} height={size} className={`${className}`} />
}
