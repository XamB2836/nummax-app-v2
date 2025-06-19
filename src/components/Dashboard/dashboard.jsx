"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Dashboard/sidebar"
import { TopNavbar } from "@/components/Dashboard/top-navbar"
import { Workspace } from "@/components/Dashboard/workspace"

export function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState("optimizer")

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNavbar toggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} activeTool={activeTool} setActiveTool={setActiveTool} />
        <Workspace collapsed={sidebarCollapsed} activeTool={activeTool} />
      </div>
    </div>
  )
}

