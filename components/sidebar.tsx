"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { LogOut, LayoutDashboard, Users, UserCheck, UserX } from "lucide-react"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    if (pathname === "/") setActiveTab("dashboard")
    else if (pathname === "/users") setActiveTab("users")
    else if (pathname === "/approved-users") setActiveTab("approved")
    else if (pathname === "/irrelevant-leads") setActiveTab("irrelevant")
  }, [pathname])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    switch (tab) {
      case "dashboard":
        router.push("/")
        break
      case "users":
        router.push("/users")
        break
      case "approved":
        router.push("/approved-users")
        break
      case "irrelevant":
        router.push("/irrelevant-leads")
        break
    }
  }

  return (
    <ShadcnSidebar className="fixed left-0 top-0 bottom-0 w-60 z-40 border-r bg-background">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">StirOutreach</h2>
        <ThemeToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav className="px-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeTab === "dashboard" && "bg-accent text-accent-foreground",
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange("users")}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeTab === "users" && "bg-accent text-accent-foreground",
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Approved Leads
            </button>
            <button
              onClick={() => handleTabChange("approved")}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeTab === "approved" && "bg-accent text-accent-foreground",
              )}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              All Leads
            </button>
            <button
              onClick={() => handleTabChange("irrelevant")}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeTab === "irrelevant" && "bg-accent text-accent-foreground",
              )}
            >
              <UserX className="mr-2 h-4 w-4" />
              Irrelevant Leads
            </button>
          </div>
        </SidebarNav>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <button
          onClick={() => router.push("/logout")}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}

