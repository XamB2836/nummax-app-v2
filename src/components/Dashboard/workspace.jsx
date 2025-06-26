"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { GridOptimizerRoot } from "@/components/Dashboard/tools/GridOptimizerRoot"

export function Workspace({ collapsed, activeTool }) {
  // Always render the GridOptimizerRoot, regardless of activeTool
  return (
    <main
      className={cn(
        "workspace-transition flex-1 overflow-auto p-6 bg-[#121212]",
        collapsed ? "ml-16" : "ml-64"
      )}
    >
      <GridOptimizerRoot />
    </main>
  )
}
