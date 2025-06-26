import React, { useState } from "react";
import { IndoorOptimizer } from "@/components/Dashboard/tools/IndoorOptimizer";
import { OutdoorOptimizer } from "@/components/Dashboard/tools/OutdoorOptimizer";

export function GridOptimizerRoot() {
  const [mode, setMode] = useState("indoor");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Grid Optimizer</h1>
        <p className="text-muted-foreground">
          Switch between Indoor and Outdoor optimization modes
        </p>
      </header>

      <div className="w-48 mt-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground text-sm shadow-sm"
        >
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
        </select>
      </div>

      <main>
        {mode === "indoor" ? <IndoorOptimizer /> : <OutdoorOptimizer />}
      </main>
    </div>
  );
}
