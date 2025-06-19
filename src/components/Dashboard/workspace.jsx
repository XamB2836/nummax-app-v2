"use client"

import { cn } from "@/lib/utils"
import { DashboardTool } from "@/components/Dashboard/tools/dashboard-tool"
import { IndoorOptimizerTool } from "@/components/Dashboard/tools/indoor-optimizer"
import { OutdoorOptimizerTool } from "@/components/Dashboard/tools/outdoor-optimizer"

/* ========= ADD TOOL FUNCTION HERE =========  */
export function Workspace({ collapsed, activeTool }) {
  const renderTool = () => {
    switch (activeTool) {
      case "dashboard":
        return <DashboardTool />
      case "indoor":
        return <IndoorOptimizerTool />
      case "outdoor":
        return <OutdoorOptimizerTool />
    }
  }

  return (
    <main className={cn("workspace-transition flex-1 overflow-auto p-6 bg-[#121212]", collapsed ? "ml-16" : "ml-64")}>
      {renderTool()}
    </main>
  )
}

