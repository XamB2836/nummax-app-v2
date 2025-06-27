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
import { DimensionValidator } from "@/lib/DimensionValidator"
import { generateCaseSummary } from "@/lib/caseSummary"
import { RenderCell } from "@/lib/CaseRenderer"

export function IndoorOptimizer() {
  const [screenWidth, setScreenWidth] = useState(3360)
  const [screenHeight, setScreenHeight] = useState(3200)
  const [selectedPanel, setSelectedPanel] = useState(ledPanels[0].id)
  const [layoutMode, setLayoutMode] = useState("auto")

  // === calculate layout & module ===
  const { layout, mode } = chooseBestLayout(
    screenWidth,
    screenHeight,
    layoutMode === "auto" ? null : layoutMode
  )
  const ledModule = mode === "standard" ? LED_ROTATED : LED_STANDARD

  // === calculate stats ===
  const panelObj = ledPanels.find((p) => p.id === selectedPanel)
  const consumption = panelObj
    ? calculateConsumption(screenWidth, screenHeight, panelObj.wattPerM2)
    : 0

  const totalModules = [
    ...layout.standardCases,
    ...(layout.cutCases || []),
  ].reduce(
    (sum, c) =>
      sum + (c.width / ledModule.width) * (c.height / ledModule.height),
    0
  )

  const stdSum = generateCaseSummary(layout.standardCases)
  const cutSum = generateCaseSummary(layout.cutCases || [])
  const areaM2 = ((screenWidth / 1000) * (screenHeight / 1000)).toFixed(2)

  // === SVG preview scale (max 500px) ===
  const maxPreview = 500
  const previewScale = Math.min(
    maxPreview / screenWidth,
    maxPreview / screenHeight,
    1
  )
  const colorMap = { standard: "Green", cut: "orange" }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Indoor Grid Optimizer
        </h1>
        <p className="text-muted-foreground">Optimize your layout.</p>
      </div>

      {/* SCREEN PARAMETERS */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Parameters</CardTitle>
          <CardDescription>Set dimensions & panel type</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Width (mm)</label>
            <Input
              type="number"
              value={screenWidth}
              onChange={(e) => setScreenWidth(+e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Height (mm)</label>
            <Input
              type="number"
              value={screenHeight}
              onChange={(e) => setScreenHeight(+e.target.value)}
            />
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

      {/* LAYOUT + STATS */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Optimizer</CardTitle>
          <CardDescription>Grid & Cases</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SVG Preview (8 cols) */}
          <div className="col-span-1 lg:col-span-8 flex justify-center">
            <svg
              width={screenWidth * previewScale}
              height={screenHeight * previewScale}
              className="border bg-muted"
            >
              {layout.standardCases.map((cell, i) => (
                <RenderCell
                  key={`std-${i}`}
                  cell={cell}
                  scale={previewScale}
                  moduleWidth={ledModule.width}
                  moduleHeight={ledModule.height}
                  fillColor={colorMap[cell.type]}
                />
              ))}
              {layout.cutCases?.map((cell, i) => (
                <RenderCell
                  key={`cut-${i}`}
                  cell={cell}
                  scale={previewScale}
                  moduleWidth={ledModule.width}
                  moduleHeight={ledModule.height}
                  fillColor={colorMap[cell.type]}
                />
              ))}
            </svg>
          </div>

          {/* Stats Column (4 cols) */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
            {/* Warning */}
            <DimensionValidator
              width={screenWidth}
              height={screenHeight}
              moduleWidth={ledModule.width}
              moduleHeight={ledModule.height}
            />

            {/* Consumption Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Consumption :</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold">{consumption.toFixed(2)} W</p>
                <p className="text-sm text-muted-foreground">
                  Area =  {areaM2} m²
                </p>
              </CardContent>
            </Card>

            {/* Total Modules Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Modules :</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold">
                  {totalModules.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Modules placés
                </p>
              </CardContent>
            </Card>


            {/* Case Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Case Summary :</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-center list-disc list-inside text-2xl font-bold space-y-5">
                  {Object.entries(stdSum).map(([size, count]) => (
                    <li key={size}>
                      {size}: {count}
                    </li>
                  ))}
                  {Object.entries(cutSum).map(([size, count]) => (
                    <li key={size}>
                      {size}: {count}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
