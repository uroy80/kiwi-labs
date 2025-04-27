"use client"

import { useEffect, useRef } from "react"

export function FloatingShapes({
  className = "",
  count = 15,
  colors = ["#c87533", "#d4a76a", "#b36a3e", "#e6b17e", "#8c5a32"],
  minSize = 10,
  maxSize = 40,
  shapes = ["circle", "square", "triangle"],
}: {
  className?: string
  count?: number
  colors?: string[]
  minSize?: number
  maxSize?: number
  shapes?: string[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear any existing shapes
    container.innerHTML = ""

    // Create shapes
    for (let i = 0; i < count; i++) {
      const shape = document.createElement("div")
      const size = Math.random() * (maxSize - minSize) + minSize
      const color = colors[Math.floor(Math.random() * colors.length)]
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)]

      // Position randomly
      const left = Math.random() * 100
      const top = Math.random() * 100

      // Set animation properties
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 5

      // Apply styles
      shape.style.position = "absolute"
      shape.style.width = `${size}px`
      shape.style.height = `${size}px`
      shape.style.left = `${left}%`
      shape.style.top = `${top}%`
      shape.style.opacity = "0.15"
      shape.style.animation = `floating ${duration}s ease-in-out ${delay}s infinite`

      // Apply shape-specific styles
      if (shapeType === "circle") {
        shape.style.borderRadius = "50%"
        shape.style.backgroundColor = color
      } else if (shapeType === "square") {
        shape.style.backgroundColor = color
        shape.style.transform = `rotate(${Math.random() * 45}deg)`
      } else if (shapeType === "triangle") {
        shape.style.width = "0"
        shape.style.height = "0"
        shape.style.borderLeft = `${size / 2}px solid transparent`
        shape.style.borderRight = `${size / 2}px solid transparent`
        shape.style.borderBottom = `${size}px solid ${color}`
        shape.style.backgroundColor = "transparent"
      }

      container.appendChild(shape)
    }
  }, [count, colors, minSize, maxSize, shapes])

  return <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />
}
