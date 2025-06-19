import React, { useState } from "react"
import { GridOptimizerTool } from "./GridOptimizerTool"
import { GridOptimizerOut } from "./GridOptimizerOut"
import { NativeSelect } from "@/components/dashboard/ui/native-select"

export function GridOptimizerRoot() {
  const [mode, setMode] = useState("indoor")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grid Optimizer</h1>
        <p className="text-muted-foreground">Switch between Indoor and Outdoor optimization modes</p>
        <div className="w-48 mt-2">
          <NativeSelect
            value={mode}
            onChange={setMode}
            options={[
              { value: "indoor", label: "Indoor" },
              { value: "outdoor", label: "Outdoor" },
            ]}
          />
        </div>
      </div>

      {mode === "indoor" && <GridOptimizerTool />}
      {mode === "outdoor" && <GridOptimizerOut />}
    </div>
  )
}
