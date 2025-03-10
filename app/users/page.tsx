"use client"

import { Suspense } from "react"
import { UsersContent } from "@/components/users-content"
import { UsersTableSkeleton } from "@/components/loading-skeleton"

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <UsersContent />
    </Suspense>
  )
}

