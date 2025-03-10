"use client"

import { Suspense } from "react"
import { ApprovedUsersContent } from "@/components/approved-users-content"
import { UsersTableSkeleton } from "@/components/loading-skeleton"

export default function ApprovedUsersPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <ApprovedUsersContent />
    </Suspense>
  )
}

