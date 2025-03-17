"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPaletteProps {
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
}

export function ColorPalette({ colors, selectedColor, onColorSelect }: ColorPaletteProps) {
  const [customColor, setCustomColor] = useState("#000000")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color, index) => (
          <button
            key={index}
            className={`h-8 w-8 rounded-full ${selectedColor === color ? "ring-2 ring-primary ring-offset-2" : ""}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: customColor }} />
              Custom Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: customColor }} />
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-8 w-16"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-8"
                />
              </div>
              <Button onClick={() => onColorSelect(customColor)} className="w-full">
                Use This Color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

