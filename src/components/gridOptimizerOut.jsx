import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Dashboard/ui/card"
import { Input } from "@/components/Dashboard/ui/input"
import * as Select from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { calculateConsumption } from '@/lib/consumptionCalculator'
import { validateScreenDimensions } from '@/lib/InputHandler'
import { RenderCell } from '@/lib/CaseRenderer'
import { computeOutdoorLayout } from '@/lib/OutdoorLayoutEngine'

export function GridOptimizerOut() {
  const [screenWidth, setScreenWidth] = useState(1120)
  const [screenHeight, setScreenHeight] = useState(640)

  const { valid: dimsValid, warning: dimsWarning } = validateScreenDimensions(screenWidth, screenHeight)
  const layout = computeOutdoorLayout(screenWidth, screenHeight).standardCases
  const scale = 0.2

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outdoor Grid Optimizer</h1>
        <p className="text-muted-foreground">Place fixed-size outdoor cases on your screen.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screen Parameters</CardTitle>
          <CardDescription>Set the screen dimensions</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Width (mm)</label>
            <Input type="number" value={screenWidth} onChange={(e) => setScreenWidth(+e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Height (mm)</label>
            <Input type="number" value={screenHeight} onChange={(e) => setScreenHeight(+e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {dimsWarning && (
        <p className="text-destructive font-semibold">{dimsWarning}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Layout Result</CardTitle>
        </CardHeader>
        <CardContent>
          <svg width={(screenWidth * scale) + 1} height={(screenHeight * scale) + 1} className="mx-auto border bg-muted">
            {layout.map((cell, i) => (
              <RenderCell
                key={`outdoor-${i}`}
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

