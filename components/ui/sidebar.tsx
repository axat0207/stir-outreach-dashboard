"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  isCollapsed: false,
  setCollapsed: () => {},
})

interface SidebarProviderProps {
  children: React.ReactNode
}

const useSidebar = () => React.useContext(SidebarContext)

const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsed, setCollapsed] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setCollapsed }}>
      <div className="flex h-full">{children}</div>
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, ...props }, ref) => {
  return <aside ref={ref} className={cn("flex flex-col border-r bg-secondary w-60 shrink-0", className)} {...props} />
})
Sidebar.displayName = "Sidebar"

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1 space-y-2 p-4", className)} {...props} />
})
SidebarContent.displayName = "SidebarContent"

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex items-center justify-between py-2 px-4", className)} {...props} />
})
SidebarHeader.displayName = "SidebarHeader"

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex items-center py-2 px-4 border-t", className)} {...props} />
})
SidebarFooter.displayName = "SidebarFooter"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(({ className, ...props }, ref) => {
  return <nav ref={ref} className={cn("flex flex-col space-y-1", className)} {...props} />
})
SidebarNav.displayName = "SidebarNav"

interface SidebarNavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode
}

const SidebarNavLink = React.forwardRef<HTMLAnchorElement, SidebarNavLinkProps>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          className,
        )}
        {...props}
      >
        {icon}
        {children}
      </a>
    )
  },
)
SidebarNavLink.displayName = "SidebarNavLink"

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarNav,
  SidebarNavLink,
}

