"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Download, Eraser, Image, Redo, Square, Undo, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ColorPalette } from "./color-palette"
import { BeadGrid } from "./bead-grid"
import { BeadPreview } from "./bead-preview"
import { defaultPalette } from "@/lib/colors"

export default function BeadEditor() {
  const [gridSize, setGridSize] = useState({ width: 20, height: 20 })
  const [beadSize, setBeadSize] = useState(20)
  const [selectedColor, setSelectedColor] = useState(defaultPalette[0])
  const [tool, setTool] = useState<"draw" | "erase">("draw")
  const [grid, setGrid] = useState<string[][]>(() => {
    return Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill("transparent"))
  })
  const [history, setHistory] = useState<string[][][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Update grid when size changes
  useEffect(() => {
    const newGrid = Array(gridSize.height)
      .fill(null)
      .map((_, y) =>
        Array(gridSize.width)
          .fill(null)
          .map((_, x) => (y < grid.length && x < grid[0].length ? grid[y][x] : "transparent")),
      )
    setGrid(newGrid)
    addToHistory(newGrid)
  }, [gridSize])

  // Add current state to history
  const addToHistory = (newGrid: string[][]) => {
    const newHistory = [...history.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(newGrid))]
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setGrid(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setGrid(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    setTool("draw")
  }

  const handleBeadClick = (x: number, y: number) => {
    const newGrid = [...grid]
    newGrid[y][x] = tool === "draw" ? selectedColor : "transparent"
    setGrid(newGrid)
    addToHistory(newGrid)
  }

  const handleClearGrid = () => {
    const newGrid = Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill("transparent"))
    setGrid(newGrid)
    addToHistory(newGrid)
  }

  const handleExport = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pixelSize = 10
    canvas.width = gridSize.width * pixelSize
    canvas.height = gridSize.height * pixelSize

    // Draw the beads
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const color = grid[y][x]
        if (color !== "transparent") {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x * pixelSize + pixelSize / 2, y * pixelSize + pixelSize / 2, pixelSize / 2 - 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Create download link
    const link = document.createElement("a")
    link.download = "bead-pattern.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Resize to fit our grid
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = gridSize.width
        canvas.height = gridSize.height
        ctx.drawImage(img, 0, 0, gridSize.width, gridSize.height)

        // Sample colors and find closest match in palette
        const newGrid = [...grid]
        const imageData = ctx.getImageData(0, 0, gridSize.width, gridSize.height)

        for (let y = 0; y < gridSize.height; y++) {
          for (let x = 0; x < gridSize.width; x++) {
            const i = (y * gridSize.width + x) * 4
            const r = imageData.data[i]
            const g = imageData.data[i + 1]
            const b = imageData.data[i + 2]
            const a = imageData.data[i + 3]

            if (a < 128) {
              newGrid[y][x] = "transparent"
            } else {
              // Find closest color in palette
              let closestColor = defaultPalette[0]
              let minDistance = Number.MAX_VALUE

              for (const color of defaultPalette) {
                const [cr, cg, cb] = hexToRgb(color)
                const distance = Math.sqrt(Math.pow(cr - r, 2) + Math.pow(cg - g, 2) + Math.pow(cb - b, 2))

                if (distance < minDistance) {
                  minDistance = distance
                  closestColor = color
                }
              }

              newGrid[y][x] = closestColor
            }
          }
        }

        setGrid(newGrid)
        addToHistory(newGrid)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
      : [0, 0, 0]
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTool("draw")}
                  className={tool === "draw" ? "bg-muted" : ""}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Draw</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTool("erase")}
                  className={tool === "erase" ? "bg-muted" : ""}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Erase</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImport} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import Image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Pattern</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm">Grid Size:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="50"
                value={gridSize.width}
                onChange={(e) => setGridSize({ ...gridSize, width: Number.parseInt(e.target.value) || 5 })}
                className="w-16 rounded-md border px-2 py-1 text-sm"
              />
              <span>×</span>
              <input
                type="number"
                min="5"
                max="50"
                value={gridSize.height}
                onChange={(e) => setGridSize({ ...gridSize, height: Number.parseInt(e.target.value) || 5 })}
                className="w-16 rounded-md border px-2 py-1 text-sm"
              />
            </div>
          </div>

          <Button variant="outline" onClick={handleClearGrid}>
            Clear
          </Button>
        </div>

        <div className="overflow-auto rounded-lg border bg-background p-4">
          <BeadGrid grid={grid} beadSize={beadSize} onBeadClick={handleBeadClick} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Bead Size:</span>
          <Slider
            value={[beadSize]}
            min={10}
            max={30}
            step={1}
            onValueChange={(value) => setBeadSize(value[0])}
            className="w-32"
          />
          <span className="text-sm">{beadSize}px</span>
        </div>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="palette">
          <TabsList className="w-full">
            <TabsTrigger value="palette" className="flex-1">
              Color Palette
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="palette" className="mt-2">
            <ColorPalette colors={defaultPalette} selectedColor={selectedColor} onColorSelect={handleColorChange} />
          </TabsContent>
          <TabsContent value="preview" className="mt-2">
            <BeadPreview grid={grid} />
          </TabsContent>
        </Tabs>

        <div className="rounded-lg border bg-muted/40 p-4">
          <h3 className="mb-2 font-medium">Tips</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Click on the grid to place beads</li>
            <li>• Use the eraser tool to remove beads</li>
            <li>• Import images to convert to bead patterns</li>
            <li>• Export your design when finished</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

