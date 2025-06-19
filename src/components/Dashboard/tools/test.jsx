"use client";

//import { Card, CardHeader, CardContent, CardTitle } from "@/components/Dashboard/ui/card";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/ui/card";
import GridOptimizer from "@/components/gridOptimizer";
import OutdoorOptimizer from "@/components/outdoorOptimizer";

export function GridOptimizerTool() {
  const [mode, setMode] = useState("indoor");

  return (
    <Card className="hover-effect tool-card">
      <CardHeader>
        <CardTitle>Grid Optimizer</CardTitle>
        <div className="mt-2 w-48">
          <select
            className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground text-sm shadow-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {mode === "indoor" ? <GridOptimizer /> : <OutdoorOptimizer />}
      </CardContent>
    </Card>
  );
}
