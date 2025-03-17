"use client"

import { useRef, useEffect } from "react"

interface BeadPreviewProps {
  grid: string[][]
}

export function BeadPreview({ grid }: BeadPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = grid[0].length
    const height = grid.length

    // Calculate bead size to fit the canvas
    const maxWidth = 280 // Adjust based on your container
    const beadSize = Math.min(10, Math.floor(maxWidth / width))

    // Set canvas size
    canvas.width = width * beadSize
    canvas.height = height * beadSize

    // Clear canvas
    ctx.fillStyle = "#f8fafc" // Light background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw beads with a realistic look
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = grid[y][x]
        if (color !== "transparent") {
          // Base bead
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x * beadSize + beadSize / 2, y * beadSize + beadSize / 2, beadSize / 2 - 0.5, 0, Math.PI * 2)
          ctx.fill()

          // Highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
          ctx.beginPath()
          ctx.arc(
            x * beadSize + beadSize / 2 - beadSize / 5,
            y * beadSize + beadSize / 2 - beadSize / 5,
            beadSize / 4,
            0,
            Math.PI * 2,
          )
          ctx.fill()
        }
      }
    }
  }, [grid])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-slate-50 p-4">
        <canvas ref={canvasRef} className="mx-auto" />
      </div>
      <div className="text-sm text-muted-foreground">
        <p>
          Pattern size: {grid[0].length} × {grid.length} beads
        </p>
        <p>Beads used: {grid.flat().filter((color) => color !== "transparent").length}</p>
      </div>
    </div>
  )
}

