import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Dashboard/ui/card"
import { Input } from "@/components/Dashboard/ui/input"
import { RenderCell } from "@/lib/CaseRenderer"
import { validateScreenDimensions } from "@/lib/InputHandler"

const OUTDOOR_CASES = [
  { width: 960, height: 320 },
  { width: 960, height: 640 },
  { width: 960, height: 960 },
  { width: 960, height: 1280 },
  { width: 1280, height: 320 },
  { width: 1280, height: 640 },
  { width: 1280, height: 960 },
  { width: 1280, height: 1280 },
  { width: 1600, height: 640 },
  { width: 1600, height: 960 },
]

export function OutdoorOptimizer() {
  const [screenWidth, setScreenWidth] = useState(1120)
  const [screenHeight, setScreenHeight] = useState(640)
  const { valid, warning } = validateScreenDimensions(screenWidth, screenHeight)
  const layout = arrangeOutdoorCases(screenWidth, screenHeight)
  const scale = 0.2

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outdoor Optimizer</h1>
        <p className="text-muted-foreground">Arrange fixed-size outdoor cases on your screen.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screen Parameters</CardTitle>
          <CardDescription>Enter width and height</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Width (mm)</label>
            <Input type="number" value={screenWidth} onChange={e => setScreenWidth(+e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Height (mm)</label>
            <Input type="number" value={screenHeight} onChange={e => setScreenHeight(+e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {warning && (
        <p className="text-destructive font-semibold">{warning}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Layout Result</CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            width={(screenWidth * scale) + 1}
            height={(screenHeight * scale) + 1}
            className="mx-auto border bg-muted"
          >
            {layout.map((cell, i) => (
              <RenderCell
                key={i}
                cell={cell}
                scale={scale}
                moduleWidth={cell.width}
                moduleHeight={cell.height}
                fillColor="green"
              />
            ))}
          </svg>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Cases</CardTitle>
          <CardDescription>Number of outdoor cases placed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-lg font-semibold">{layout.length}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function arrangeOutdoorCases(screenWidth, screenHeight) {
  const placed = []
  let y = 0
  let remainingHeight = screenHeight

  while (remainingHeight > 0) {
    let x = 0
    let remainingWidth = screenWidth
    let rowHasItem = false
    const rowItems = []

    // fill one row
    while (remainingWidth > 0) {
      const fit = OUTDOOR_CASES.find(c => c.width <= remainingWidth && c.height <= remainingHeight)
      if (!fit) break
      rowHasItem = true
      rowItems.push({ ...fit, x, y, type: 'standard' })
      x += fit.width
      remainingWidth -= fit.width
    }
    if (!rowHasItem) break

    // commit row
    placed.push(...rowItems)
    const maxRowHeight = Math.max(...rowItems.map(item => item.height))
    y += maxRowHeight
    remainingHeight -= maxRowHeight
  }

  return placed
}
