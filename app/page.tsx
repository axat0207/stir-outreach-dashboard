"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { DashboardContent } from "@/components/dashboard-content"
import { UsersContent } from "@/components/users-content"
import { ApprovedUsersContent } from "@/components/approved-users-content"
import { DashboardSkeleton, UsersTableSkeleton } from "@/components/loading-skeleton"

export default function Home() {
  const pathname = usePathname()

  return (
    <div className="w-full h-[100vh] overflow-auto">
      {pathname === "/" && (
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      )}
      {pathname === "/users" && (
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersContent />
        </Suspense>
      )}
      {pathname === "/approved-users" && (
        <Suspense fallback={<UsersTableSkeleton />}>
          <ApprovedUsersContent />
        </Suspense>
      )}
    </div>
  )
}

