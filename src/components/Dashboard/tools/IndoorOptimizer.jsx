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
import { indoorLedModules, getModuleById } from "@/lib/OptimizerCore"
import { chooseBestLayout } from "@/lib/LayoutEngine"
import { countModules, computeAreaM2 } from "@/lib/layoutStats"
import { calculateConsumption } from "@/lib/consumptionCalculator"
import { DimensionValidator } from "@/lib/DimensionValidator"
import { generateCaseSummary } from "@/lib/caseSummary"
import { RenderCell, ModuleGridLines } from "@/lib/CaseRenderer"

export function IndoorOptimizer() {
  const [screenWidth, setScreenWidth] = useState(3360)
  const [screenHeight, setScreenHeight] = useState(3200)
  const [selectedModule, setSelectedModule] = useState(indoorLedModules[0].id)
  const [layoutMode, setLayoutMode] = useState("auto")

  // === calculate layout & module ===
  const moduleObj = getModuleById(selectedModule)
  const { layout, mode } = chooseBestLayout(
    screenWidth,
    screenHeight,
    moduleObj,
    layoutMode === "auto" ? null : layoutMode
  )
  const ledModule =
    mode === "standard"
      ? { width: moduleObj.height, height: moduleObj.width }
      : { width: moduleObj.width, height: moduleObj.height }

  // === calculate stats ===
  const consumption = moduleObj
    ? calculateConsumption(screenWidth, screenHeight, moduleObj.wattPerM2)
    : 0

  const totalModules = countModules(layout, ledModule.width, ledModule.height)

  const stdSum = generateCaseSummary(layout.standardCases)
  const cutSum = generateCaseSummary(layout.cutCases || [])
  const areaM2 = computeAreaM2(screenWidth, screenHeight).toFixed(2)

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
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
            >
              {indoorLedModules.map((p) => (
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
              <ModuleGridLines
                screenWidth={screenWidth}
                screenHeight={screenHeight}
                scale={previewScale}
                moduleWidth={ledModule.width}
                moduleHeight={ledModule.height}
              />
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
