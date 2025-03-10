"use client"

import { Suspense } from "react"
import { IrrelevantLeadsContent } from "@/components/irrelevant-leads-content"
import { UsersTableSkeleton } from "@/components/loading-skeleton"

export default function IrrelevantLeadsPage() {
  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <IrrelevantLeadsContent />
    </Suspense>
  )
}

