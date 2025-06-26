"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Dashboard/ui/card"
import { Input } from "@/components/Dashboard/ui/input"
import { LED_STANDARD, LED_ROTATED, ledPanels } from "@/lib/OptimizerCore"
import { chooseBestLayout } from "@/lib/LayoutEngine"
import { calculateConsumption } from "@/lib/consumptionCalculator"
import { validateScreenDimensions } from "@/lib/InputHandler"
import { generateCaseSummary } from "@/lib/caseSummary"
import { RenderCell } from "@/lib/CaseRenderer"

export function IndoorOptimizer() {
  const [screenWidth, setScreenWidth] = useState(1120)
  const [screenHeight, setScreenHeight] = useState(640)
  const [selectedPanel, setSelectedPanel] = useState(ledPanels[0].id)
  const [layoutMode, setLayoutMode] = useState("auto")

  const { valid, warning } = validateScreenDimensions(screenWidth, screenHeight)
  const { layout, mode } = chooseBestLayout(
    screenWidth,
    screenHeight,
    layoutMode === "auto" ? null : layoutMode
  )
  const ledModule = mode === "standard" ? LED_ROTATED : LED_STANDARD
  const panelObj = ledPanels.find((p) => p.id === selectedPanel)
  const consumption = panelObj
    ? calculateConsumption(screenWidth, screenHeight, panelObj.wattPerM2)
    : 0

  const totalModules = [...layout.standardCases, ...(layout.cutCases || [])].reduce(
    (sum, c) => sum + (c.width / ledModule.width) * (c.height / ledModule.height),
    0
  )

  const stdSum = generateCaseSummary(layout.standardCases)
  const cutSum = generateCaseSummary(layout.cutCases || [])
  const scale = 0.2
  const colorMap = { standard: "green", cut: "orange" }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Indoor Grid Optimizer</h1>
        <p className="text-muted-foreground">Optimize your layout using standard cabinets.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screen Parameters</CardTitle>
          <CardDescription>Set screen dimensions and LED panel type</CardDescription>
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
          <div>
            <label className="text-sm font-medium">LED Panel</label>
            <select
              className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground text-sm shadow-sm"
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
            >
              {ledPanels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.wattPerM2} W/m²)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Layout Mode</label>
            <select
              className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground text-sm shadow-sm"
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="standard">Force Standard</option>
              <option value="rotated">Force Rotated</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {warning && <p className="text-destructive font-semibold">{warning}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Layout Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Mode: <strong>{mode}</strong></p>
          <p>LED Module Size: {ledModule.width}×{ledModule.height}</p>
          <p>Total Modules: {totalModules.toFixed(1)}</p>

          <svg width={(screenWidth*scale)+1} height={(screenHeight*scale)+1} className="mx-auto border bg-muted">
            {layout.standardCases.map((cell, i) => (
              <RenderCell key={`std-${i}`} cell={cell} scale={scale} moduleWidth={ledModule.width} moduleHeight={ledModule.height} fillColor={colorMap[cell.type]} />
            ))}
            {layout.cutCases?.map((cell, i) => (
              <RenderCell key={`cut-${i}`} cell={cell} scale={scale} moduleWidth={ledModule.width} moduleHeight={ledModule.height} fillColor={colorMap[cell.type]} />
            ))}
          </svg>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estimated Consumption</CardTitle>
            <CardDescription>Based on screen size and panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Area: {((screenWidth/1000)*(screenHeight/1000)).toFixed(2)} m²</p>
            <p>Panel: {panelObj?.name} ({panelObj?.wattPerM2} W/m²)</p>
            <p className="font-semibold">Total: {consumption.toFixed(2)} W</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseSummary title="Standard" summary={stdSum} />
            <CaseSummary title="Cut" summary={cutSum} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Modules</CardTitle>
            <CardDescription>Total modules placed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{totalModules.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CaseSummary({ title, summary }) {
  return (
    <div className="space-y-1">
      <h4 className="font-medium">{title}</h4>
      <ul className="list-disc list-inside text-sm">
        {Object.entries(summary).map(([size, count]) => (
          <li key={size}>{size}: {count}</li>
        ))}
      </ul>
    </div>
  )
}
