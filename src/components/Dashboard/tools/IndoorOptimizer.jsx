import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/ui/card"
import { Input } from "@/components/dashboard/ui/input"
import * as Select from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { LED_STANDARD, LED_ROTATED, ledPanels } from '@/lib/OptimizerCore'
import { chooseBestLayout } from '@/lib/LayoutEngine'
import { calculateConsumption } from '@/lib/consumptionCalculator'
import { validateScreenDimensions } from '@/lib/InputHandler'
import { generateCaseSummary } from '@/lib/caseSummary'
import { RenderCell } from '@/lib/CaseRenderer'

export function GridOptimizerTool() {
  const [screenWidth, setScreenWidth] = useState(1120)
  const [screenHeight, setScreenHeight] = useState(640)
  const [selectedPanel, setSelectedPanel] = useState(ledPanels[0].id)
  const [modeOverride, setModeOverride] = useState("auto")

  const { valid: dimsValid, warning: dimsWarning } = validateScreenDimensions(screenWidth, screenHeight)
  const { layout, mode } = chooseBestLayout(screenWidth, screenHeight, modeOverride === "auto" ? null : modeOverride)
  const ledModule = mode === "standard" ? LED_ROTATED : LED_STANDARD
  const selectedPanelObj = ledPanels.find((p) => p.id === selectedPanel)
  const consumption = selectedPanelObj ? calculateConsumption(screenWidth, screenHeight, selectedPanelObj.wattPerM2) : 0
  const totalModules = [...layout.standardCases, ...(layout.cutCases || [])].reduce(
    (sum, c) => sum + ((c.width / ledModule.width) * (c.height / ledModule.height)),
    0
  )

  const scale = 0.2
  const colorMap = {
    standard: "green",
    cut: "orange",
  }
  const stdSum = generateCaseSummary(layout.standardCases)
  const cutSum = generateCaseSummary(layout.cutCases || [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Indoor Grid Optimizer</h1>
        <p className="text-muted-foreground">Optimize your layout using standard cabinets.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screen Parameters</CardTitle>
          <CardDescription>Set the screen dimensions and LED panel type.</CardDescription>
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
            <NativeSelect value={selectedPanel} onChange={setSelectedPanel} options={ledPanels.map(p => ({ value: p.id, label: `${p.name} (${p.wattPerM2} W/m²)` }))} />
          </div>
          <div>
            <label className="text-sm font-medium">Layout Mode</label>
            <NativeSelect value={modeOverride} onChange={setModeOverride} options={[{ value: "auto", label: "Auto" }, { value: "standard", label: "Force Standard" }, { value: "rotated", label: "Force Rotated" }]} />
          </div>
        </CardContent>
      </Card>

      {(layout.warning || dimsWarning) && (
        <p className="text-destructive font-semibold">{layout.warning || dimsWarning}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Layout Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Selected Mode: <strong>{mode}</strong></p>
          <p>LED Module: {ledModule.width} × {ledModule.height}</p>
          <p>Total Modules: {totalModules.toFixed(1)}</p>

          <svg width={(screenWidth * scale) + 1} height={(screenHeight * scale) + 1} className="mx-auto border bg-muted">
            {layout.standardCases.map((cell, i) => (
              <RenderCell
                key={`std-${i}`}
                cell={cell}
                scale={scale}
                moduleWidth={ledModule.width}
                moduleHeight={ledModule.height}
                fillColor={colorMap[cell.type]}
              />
            ))}
            {(layout.cutCases || []).map((cell, i) => (
              <RenderCell
                key={`cut-${i}`}
                cell={cell}
                scale={scale}
                moduleWidth={ledModule.width}
                moduleHeight={ledModule.height}
                fillColor={colorMap[cell.type]}
              />
            ))}
          </svg>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estimated Consumption</CardTitle>
            <CardDescription>Based on screen size and selected panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Area: {((screenWidth / 1000) * (screenHeight / 1000)).toFixed(2)} m²</p>
            <p>Panel: {selectedPanelObj?.name} ({selectedPanelObj?.wattPerM2} W/m²)</p>
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
</div>

<Card>
  <CardHeader>
    <CardTitle>Total Modules</CardTitle>
    <CardDescription>Total number of modules in the layout</CardDescription>
  </CardHeader>
  <CardContent className="space-y-2">
    <p className="text-sm">Module Dimensions: {ledModule.width} x {ledModule.height} mm</p>
    <p className="text-lg font-semibold">Total Modules: {totalModules.toFixed(1)}</p>
  </CardContent>
</Card>

</div>
  )
}

function NativeSelect({ value, onChange, options }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="inline-flex items-center justify-between h-10 px-3 w-full rounded-md border bg-background text-sm shadow-sm">
        <Select.Value placeholder="Select..." />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-popover border shadow-md rounded-md z-50 text-popover-foreground">
          <Select.ScrollUpButton className="flex items-center justify-center h-6">
            <ChevronUp className="h-4 w-4" />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="relative px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent text-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-6">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
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
