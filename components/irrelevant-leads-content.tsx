"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { UserCheck, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  user_id: string
  username: string
  followers: number
  campaign: string
  poc: string
  poc_email_address: string
  tier: string
}

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="capitalize">
        <a
          href={`https://instagram.com/${row.getValue("username")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.getValue("username")}
        </a>
      </div>
    ),
  },
  {
    accessorKey: "followers",
    header: "Followers",
    cell: ({ row }) => {
      const followers = Number.parseInt(row.getValue("followers"))
      const formatted =
        followers >= 1000000
          ? `${(followers / 1000000).toFixed(1)}M`
          : followers >= 1000
            ? `${(followers / 1000).toFixed(1)}K`
            : followers
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "campaign",
    header: "Campaign",
  },
  {
    accessorKey: "poc",
    header: "POC",
    cell: ({ row }) => (
      <div>
        {row.getValue("poc")} ({row.getValue("poc_email_address")})
      </div>
    ),
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => <div className="capitalize">{row.getValue("tier")}</div>,
  },
]

export function IrrelevantLeadsContent() {
  const [data, setData] = React.useState<User[]>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [loading, setLoading] = React.useState(true)
  const [restoring, setRestoring] = React.useState(false)
  const { toast } = useToast()

  // Fetch irrelevant users
  const fetchIrrelevantUsers = async () => {
    try {
      setLoading(true)

      // Get irrelevant user IDs from localStorage
      const irrelevantUserIds = JSON.parse(localStorage.getItem("irrelevantUsers") || "[]")

      if (irrelevantUserIds.length === 0) {
        setData([])
        setLoading(false)
        return
      }

      // Fetch all users from API
      const response = await fetch("https://stir-email-outreach.onrender.com/api/insta-users/users")
      const jsonData = await response.json()
      const allUsers = jsonData.data || jsonData.users || []

      // Filter to only include irrelevant users
      const irrelevantUsers = allUsers.filter((user: User) => irrelevantUserIds.includes(user.user_id))

      setData(irrelevantUsers)
    } catch (error) {
      console.error("Error fetching irrelevant users:", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchIrrelevantUsers()
  }, [])

  const restoreUsers = () => {
    setRestoring(true)

    // Get selected user IDs
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedUserIds = selectedRows.map((row) => row.original.user_id)

    if (selectedUserIds.length === 0) {
      setRestoring(false)
      return
    }

    // In a real app, you would call an API here
    setTimeout(() => {
      // Get existing irrelevant users from localStorage
      const existingIrrelevantUsers = JSON.parse(localStorage.getItem("irrelevantUsers") || "[]")

      // Remove restored users
      const updatedIrrelevantUsers = existingIrrelevantUsers.filter((id: string) => !selectedUserIds.includes(id))

      // Save back to localStorage
      localStorage.setItem("irrelevantUsers", JSON.stringify(updatedIrrelevantUsers))

      // Update UI by removing restored users
      setData((prevUsers) => prevUsers.filter((user) => !selectedUserIds.includes(user.user_id)))

      // Reset selection
      setRowSelection({})
      setRestoring(false)

      toast({
        title: "Users restored",
        description: `${selectedUserIds.length} users have been moved back to All Leads.`,
      })
    }, 1000)
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  })

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Irrelevant Leads</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={restoreUsers}
          disabled={table.getFilteredSelectedRowModel().rows.length === 0 || restoring}
        >
          {restoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Restoring...
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              Restore to All Leads
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No irrelevant leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}

