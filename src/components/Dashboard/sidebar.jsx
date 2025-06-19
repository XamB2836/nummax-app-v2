"use client"

import { Grid2x2Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Dashboard/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/Dashboard/ui/tooltip"


function SidebarItem({ icon: Icon, label, active, collapsed, onClick }) {
  const content = (
    <Button
      variant={active ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 px-3 py-6",
        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
      )}
      onClick={onClick}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-muted-foreground")} />
      {!collapsed && <span>{label}</span>}
    </Button>
  )

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-secondary text-secondary-foreground">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}
/* ====  ADD TOOLS TO SIDEBAR ==== */
export function Sidebar({ collapsed, activeTool, setActiveTool }) {
  const tools = [
    { type: "optimizer", label: "Grid Optimizer", icon: Grid2x2Check }
  ]

  return (
    <div
      className={cn(
        "sidebar-transition bg-[#1A1A1A] border-r border-border flex flex-col h-full",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex-1 py-4 space-y-2">
        {tools.map((tool) => (
          <SidebarItem
            key={tool.type}
            icon={tool.icon}
            label={tool.label}
            active={activeTool === tool.type}
            collapsed={collapsed}
            onClick={() => setActiveTool(tool.type)}
          />
        ))}
      </div>
    </div>
  )
}