"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Loader2, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Update the User interface to include new fields
interface User {
  id: number
  user_id: string
  username: string
  followers: number
  campaign: string
  poc: string
  poc_email_address: string
  tier: string
  first_email_status: string | null
  onboarding_status: string | null
  calendly_link_clicked: boolean
  video_call_status: string | null
  replied: boolean
  follow_up_1_status: string | null
  follow_up_2_status: string | null
  referral: string | null
  unsubscribed: boolean
  links?: string
  notes?: string
}

// Update the columns array to rearrange columns and add Links and Notes
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
    accessorKey: "poc",
    header: "POC",
    cell: ({ row }) => (
      <div>
        {row.getValue("poc")} ({row.getValue("poc_email_address")})
      </div>
    ),
  },
  {
    accessorKey: "first_email_status",
    header: "First Email",
    cell: ({ row }) => <div>{row.getValue("first_email_status") || "Not Sent"}</div>,
  },
  {
    accessorKey: "onboarding_status",
    header: "Onboarding",
    cell: ({ row }) => <div>{row.getValue("onboarding_status") || "Not Started"}</div>,
  },
  {
    accessorKey: "calendly_link_clicked",
    header: "Calendly",
    cell: ({ row }) => (
      <div className={row.getValue("calendly_link_clicked") ? "text-green-600" : "text-muted-foreground"}>
        {row.getValue("calendly_link_clicked") ? "Clicked" : "Not Clicked"}
      </div>
    ),
  },
  {
    accessorKey: "video_call_status",
    header: "Video Call",
    cell: ({ row }) => <div>{row.getValue("video_call_status") || "Not Scheduled"}</div>,
  },
  {
    accessorKey: "replied",
    header: "Reply Status",
    cell: ({ row }) => (
      <div className={row.getValue("replied") ? "text-green-600" : "text-muted-foreground"}>
        {row.getValue("replied") ? "Replied" : "No Reply"}
      </div>
    ),
  },
  {
    accessorKey: "follow_ups",
    header: "Follow-ups",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span>1: {row.original.follow_up_1_status || "N/A"}</span>
        <span>2: {row.original.follow_up_2_status || "N/A"}</span>
      </div>
    ),
  },
  {
    accessorKey: "referral",
    header: "Referral",
    cell: ({ row }) => <div>{row.getValue("referral") || "N/A"}</div>,
  },
  {
    accessorKey: "unsubscribed",
    header: "Unsubscribe",
    cell: ({ row }) => (
      <div className={row.getValue("unsubscribed") ? "text-red-600" : "text-green-600"}>
        {row.getValue("unsubscribed") ? "Unsubscribed" : "Subscribed"}
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
    cell: ({ row }) => {
      const campaign = row.getValue("campaign") as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="capitalize">{campaign}</div>
            </TooltipTrigger>
            <TooltipContent>
              {campaign === "Gold" && "1M+ followers"}
              {campaign === "Silver" && "500K-1M followers"}
              {campaign === "Bronze" && "100K-500K followers"}
              {campaign === "Micro" && "10K-100K followers"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "links",
    header: "Links",
    cell: ({ row }) => {
      const [links, setLinks] = useState(row.original.links || "")
      const [isEditing, setIsEditing] = useState(false)

      const handleSave = () => {
        // In a real app, you would save this to your backend
        console.log(`Saving links for user ${row.original.user_id}:`, links)
        setIsEditing(false)
      }

      return isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            className="h-8 w-full"
            placeholder="Enter links"
          />
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="truncate max-w-[150px]">{links || "No links"}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const [notes, setNotes] = useState(row.original.notes || "")
      const [isEditing, setIsEditing] = useState(false)

      const handleSave = () => {
        // In a real app, you would save this to your backend
        console.log(`Saving notes for user ${row.original.user_id}:`, notes)
        setIsEditing(false)
      }

      return isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 w-full"
            placeholder="Enter notes"
          />
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="truncate max-w-[150px]">{notes || "No notes"}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
      )
    },
  },
]

export function AllLeadsContent() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = React.useState<User[]>([]) // Initialize as empty array
  const [loading, setLoading] = React.useState(true)
  const { toast } = useToast()
  const [markingIrrelevant, setMarkingIrrelevant] = React.useState(false)
  const [irrelevantDialogOpen, setIrrelevantDialogOpen] = React.useState(false)
  const [irrelevantReason, setIrrelevantReason] = React.useState("")
  const [followerRange, setFollowerRange] = React.useState("all")
  const [tierFilter, setTierFilter] = React.useState("all")
  const [sort, setSort] = React.useState({ key: "", direction: "asc" })

  // Add these state variables and constants to the component
  const [pocFilter, setPocFilter] = useState("all")
  const [calendlyFilter, setCalendlyFilter] = useState("all")
  const [onboardingFilter, setOnboardingFilter] = useState("all")
  const [replyFilter, setReplyFilter] = useState("all")

  const POC_OPTIONS = [
    { value: "all", label: "All POCs" },
    { value: "yug@createstir.com", label: "Yug" },
    { value: "ankur@createstir.com", label: "Ankur" },
    { value: "akshat@createstir.com", label: "Akshat" },
  ]

  const CALENDLY_OPTIONS = [
    { value: "all", label: "All Calendly Status" },
    { value: "clicked", label: "Clicked" },
    { value: "not_clicked", label: "Not Clicked" },
  ]

  const ONBOARDING_OPTIONS = [
    { value: "all", label: "All Onboarding Status" },
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
    { value: "not_started", label: "Not Started" },
  ]

  const REPLY_OPTIONS = [
    { value: "all", label: "All Reply Status" },
    { value: "replied", label: "Replied" },
    { value: "not_replied", label: "Not Replied" },
  ]

  const table = useReactTable({
    data: [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const getTierFromFollowers = (followers: number) => {
    if (followers >= 1000000) return "gold"
    if (followers >= 100000) return "silver"
    if (followers >= 50000) return "bronze"
    return "micro"
  }

  // Update the filteredAndSortedUsers function to include the new filters
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (table.getColumn("username")?.getFilterValue()) {
      const searchTerm = (table.getColumn("username")?.getFilterValue() as string).toLowerCase()
      filtered = filtered.filter((user) => user.username.toLowerCase().includes(searchTerm))
    }

    // Apply follower range filter
    if (followerRange !== "all") {
      switch (followerRange) {
        case "1m_plus":
          filtered = filtered.filter((user) => user.followers >= 1000000)
          break
        case "500k_1m":
          filtered = filtered.filter((user) => user.followers >= 500000 && user.followers < 1000000)
          break
        case "100k_500k":
          filtered = filtered.filter((user) => user.followers >= 100000 && user.followers < 500000)
          break
        case "50k_100k":
          filtered = filtered.filter((user) => user.followers >= 50000 && user.followers < 100000)
          break
        case "10k_50k":
          filtered = filtered.filter((user) => user.followers >= 10000 && user.followers < 50000)
          break
        case "less_10k":
          filtered = filtered.filter((user) => user.followers < 10000)
          break
      }
    }

    // Apply tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userTier = getTierFromFollowers(user.followers)
        return userTier === tierFilter
      })
    }

    // Apply POC filter
    if (pocFilter !== "all") {
      filtered = filtered.filter((user) => user.poc_email_address === pocFilter)
    }

    // Apply Calendly filter
    if (calendlyFilter !== "all") {
      filtered = filtered.filter(
        (user) =>
          (calendlyFilter === "clicked" && user.calendly_link_clicked) ||
          (calendlyFilter === "not_clicked" && !user.calendly_link_clicked),
      )
    }

    // Apply Onboarding filter
    if (onboardingFilter !== "all") {
      filtered = filtered.filter((user) => {
        if (onboardingFilter === "completed" && user.onboarding_status === "Completed") return true
        if (onboardingFilter === "in_progress" && user.onboarding_status === "In Progress") return true
        if (onboardingFilter === "not_started" && (!user.onboarding_status || user.onboarding_status === "Not Started"))
          return true
        return false
      })
    }

    // Apply Reply filter
    if (replyFilter !== "all") {
      filtered = filtered.filter(
        (user) => (replyFilter === "replied" && user.replied) || (replyFilter === "not_replied" && !user.replied),
      )
    }

    // Apply sorting
    if (sort.key) {
      filtered.sort((a, b) => {
        const aValue = a[sort.key]
        const bValue = b[sort.key]

        if (aValue === null) return sort.direction === "asc" ? -1 : 1
        if (bValue === null) return sort.direction === "asc" ? 1 : -1

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        const comparison = String(aValue).localeCompare(String(bValue))
        return sort.direction === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [data, followerRange, tierFilter, pocFilter, calendlyFilter, onboardingFilter, replyFilter, sort, table])

  // Update the fetchUsers function to filter out irrelevant users
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("https://stir-email-outreach.onrender.com/api/insta-users/users")
      const jsonData = await response.json()

      // Check if data exists in the response
      const usersData = jsonData.data || jsonData.users || []

      // Filter out irrelevant users that might be stored in localStorage
      const irrelevantUserIds = JSON.parse(localStorage.getItem("irrelevantUsers") || "[]")
      const filteredUsers = usersData.filter((user: User) => !irrelevantUserIds.includes(user.user_id))

      setData(filteredUsers)
    } catch (error) {
      console.error("Error fetching data:", error)
      setData([]) // Set empty array to prevent further errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data from API
  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const markAsIrrelevant = () => {
    setMarkingIrrelevant(true)

    // Get selected user IDs
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedUserIds = selectedRows.map((row) => row.original.user_id)

    if (selectedUserIds.length === 0) {
      setMarkingIrrelevant(false)
      return
    }

    // In a real app, you would call an API here
    setTimeout(() => {
      // Get existing irrelevant users from localStorage
      const existingIrrelevantUsers = JSON.parse(localStorage.getItem("irrelevantUsers") || "[]")

      // Add newly marked users
      const updatedIrrelevantUsers = [...existingIrrelevantUsers, ...selectedUserIds]

      // Save back to localStorage
      localStorage.setItem("irrelevantUsers", JSON.stringify(updatedIrrelevantUsers))

      // Update UI by removing marked users
      setData((prevUsers) => prevUsers.filter((user) => !selectedUserIds.includes(user.user_id)))

      // Reset selection
      setRowSelection({})
      setIrrelevantDialogOpen(false)
      setMarkingIrrelevant(false)
      setIrrelevantReason("")

      toast({
        title: "Users marked as irrelevant",
        description: `${selectedUserIds.length} users have been moved to Irrelevant Leads.`,
      })
    }, 1000)
  }

  table.options.data = filteredAndSortedUsers

  // Update the resetFilters function to reset the new filters
  const resetFilters = () => {
    setFollowerRange("all")
    setTierFilter("all")
    setPocFilter("all")
    setCalendlyFilter("all")
    setOnboardingFilter("all")
    setReplyFilter("all")
    table.getColumn("username")?.setFilterValue("")
    setSort({ key: "", direction: "asc" })
  }

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full p-6">
      <h1 className="text-3xl font-bold mb-6">All Leads</h1>

      {/* Add these filter dropdowns to the UI in the filters section */}
      <div className="flex items-center py-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Filter usernames..."
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("username")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />

          <Select value={followerRange} onValueChange={setFollowerRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Follower Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Follower Ranges</SelectItem>
              <SelectItem value="1m_plus">1M+ Followers</SelectItem>
              <SelectItem value="500k_1m">500K-1M Followers</SelectItem>
              <SelectItem value="100k_500k">100K-500K Followers</SelectItem>
              <SelectItem value="50k_100k">50K-100K Followers</SelectItem>
              <SelectItem value="10k_50k">10K-50K Followers</SelectItem>
              <SelectItem value="less_10k">Less than 10K</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="micro">Micro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pocFilter} onValueChange={setPocFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="POC" />
            </SelectTrigger>
            <SelectContent>
              {POC_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={calendlyFilter} onValueChange={setCalendlyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Calendly Status" />
            </SelectTrigger>
            <SelectContent>
              {CALENDLY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Onboarding Status" />
            </SelectTrigger>
            <SelectContent>
              {ONBOARDING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={replyFilter} onValueChange={setReplyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Reply Status" />
            </SelectTrigger>
            <SelectContent>
              {REPLY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Make the Mark as Irrelevant button more prominent when users are selected */}
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setIrrelevantDialogOpen(true)}
            >
              <UserX className="h-4 w-4" />
              Mark as Irrelevant ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
        </div>
      </div>

      <Dialog open={irrelevantDialogOpen} onOpenChange={setIrrelevantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Irrelevant</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark {table.getFilteredSelectedRowModel().rows.length} selected users as
              irrelevant? They will be moved to the Irrelevant Leads section.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason (optional)
              </label>
              <Input
                id="reason"
                placeholder="Enter reason for marking as irrelevant"
                value={irrelevantReason}
                onChange={(e) => setIrrelevantReason(e.target.value)}
              />
            </div>
            <h4 className="text-sm font-medium">Selected Users:</h4>
            <div className="max-h-[150px] overflow-auto space-y-2">
              {table.getFilteredSelectedRowModel().rows.map((row) => (
                <div key={row.id} className="flex items-center justify-between text-sm">
                  <span>{row.original.username}</span>
                  <span className="text-muted-foreground">{row.original.followers} followers</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIrrelevantDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={markAsIrrelevant} disabled={markingIrrelevant}>
              {markingIrrelevant ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Mark as Irrelevant"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No results.
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

