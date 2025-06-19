import React, { useState } from "react";
import { IndoorOptimizer } from "./IndoorOptimizer";
import { OutdoorOptimizer } from "./OutdoorOptimizer";

export function GridOptimizerRoot() {
  const [mode, setMode] = useState("indoor");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grid Optimizer</h1>
        <p className="text-muted-foreground">Switch between Indoor and Outdoor optimization modes</p>
        <div className="w-48 mt-2">
          <select
            className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground text-sm shadow-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>
      </div>

      {mode === "indoor" && <IndoorOptimizer />}
      {mode === "outdoor" && <OutdoorOptimizer />}
    </div>
  );
}
