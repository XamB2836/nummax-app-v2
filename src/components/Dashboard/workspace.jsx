"use client"

import { cn } from "@/lib/utils"
import { GridOptimizerTool } from "@/components/Dashboard/tools/test"

/* ========= ADD TOOL FUNCTION HERE =========  */
export function Workspace({ collapsed, activeTool }) {
  const renderTool = () => {
    switch (activeTool) {
      case "optimizer":
      default:
        return <GridOptimizerTool />
    }
  }

  return (
    <main className={cn("workspace-transition flex-1 overflow-auto p-6 bg-[#121212]", collapsed ? "ml-16" : "ml-64")}>
      {renderTool()}
    </main>
  )
}

