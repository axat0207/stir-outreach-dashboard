"use client"

import { Suspense } from "react"
import { AllLeadsContent } from "@/components/all-leads-content"
import { UsersTableSkeleton } from "@/components/loading-skeleton"

export default function AllLeadsPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <AllLeadsContent />
    </Suspense>
  )
}

