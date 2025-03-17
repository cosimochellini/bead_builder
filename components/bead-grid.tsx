"use client"

import type React from "react"

import { useRef, useEffect } from "react"

interface BeadGridProps {
  grid: string[][]
  beadSize: number
  onBeadClick: (x: number, y: number) => void
}

export function BeadGrid({ grid, beadSize, onBeadClick }: BeadGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const lastPosition = useRef({ x: -1, y: -1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = grid[0].length
    const height = grid.length

    // Set canvas size
    canvas.width = width * beadSize
    canvas.height = height * beadSize

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e2e8f0" // Tailwind slate-200
    ctx.lineWidth = 0.5

    for (let x = 0; x <= width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * beadSize, 0)
      ctx.lineTo(x * beadSize, height * beadSize)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * beadSize)
      ctx.lineTo(width * beadSize, y * beadSize)
      ctx.stroke()
    }

    // Draw beads
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = grid[y][x]
        if (color !== "transparent") {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x * beadSize + beadSize / 2, y * beadSize + beadSize / 2, beadSize / 2 - 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }, [grid, beadSize])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true
    const { x, y } = getGridCoordinates(e)
    if (x !== lastPosition.current.x || y !== lastPosition.current.y) {
      onBeadClick(x, y)
      lastPosition.current = { x, y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return

    const { x, y } = getGridCoordinates(e)
    if (x !== lastPosition.current.x || y !== lastPosition.current.y) {
      onBeadClick(x, y)
      lastPosition.current = { x, y }
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
    lastPosition.current = { x: -1, y: -1 }
  }

  const getGridCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = Math.floor(((e.clientX - rect.left) * scaleX) / beadSize)
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / beadSize)

    return {
      x: Math.max(0, Math.min(x, grid[0].length - 1)),
      y: Math.max(0, Math.min(y, grid.length - 1)),
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="cursor-crosshair"
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  )
}

