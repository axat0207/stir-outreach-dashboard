"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Instagram,
  ChevronsLeft,
  ChevronsRight,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Loader } from "@/components/ui/loader"

interface InstagramUser {
  user_id: number
  username: string
  followers_count: number
  email: string | null
  first_email_status: string | null
}

interface ApiResponse {
  page: number
  limit: number
  total_count: string
  total_pages: number
  users: InstagramUser[]
}

type SortConfig = {
  key: keyof InstagramUser | ""
  direction: "asc" | "desc"
}

const FOLLOWERS_RANGES = [
  { label: "Followers", value: "all" },
  { label: "1M+", min: 1000000, max: Number.POSITIVE_INFINITY },
  { label: "500K-1M", min: 500000, max: 1000000 },
  { label: "100K-500K", min: 100000, max: 500000 },
  { label: "50K-100K", min: 50000, max: 100000 },
  { label: "10K-50K", min: 10000, max: 50000 },
  { label: "<10K", min: 0, max: 10000 },
]

// Update the POC_OPTIONS to include Yug, Ankur, and Akshat for all campaigns
const POC_OPTIONS = [
  { value: "yug@createstir.com", label: "Yug", email: "yug@createstir.com" },
  { value: "ankur@createstir.com", label: "Ankur", email: "ankur@createstir.com" },
  { value: "akshat@createstir.com", label: "Akshat", email: "akshat@createstir.com" },
]

// Update the TIER_INFO constant to match the new campaign names
const TIER_INFO = {
  gold: "1M+ followers",
  silver: "100K - 1M followers",
  bronze: "50K - 100K followers",
  micro: "Under 50K followers",
}

// Update the getTierFromFollowers function to match the new campaign names
const getTierFromFollowers = (followers: number) => {
  if (followers >= 1000000) return "gold"
  if (followers >= 100000) return "silver"
  if (followers >= 50000) return "bronze"
  return "micro"
}

export function ApprovedUsersContent() {
  const [users, setUsers] = useState<InstagramUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [followerRange, setFollowerRange] = useState("all")
  const [pocFilter, setPocFilter] = useState("all")
  const [sort, setSort] = useState<SortConfig>({ key: "", direction: "asc" })
  const [selectedPOCs, setSelectedPOCs] = useState<Record<number, string>>({})
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  // Update the fetchUsers function to automatically set the campaign based on follower count
  const fetchUsers = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`https://stir-email-outreach.onrender.com/api/insta-users/users?page=${page}`)
      const data: ApiResponse = await response.json()
      setUsers(data.users)
      setTotalPages(data.total_pages)
      setTotalCount(Number(data.total_count))

      // Initialize POCs for new users
      const newPOCs = { ...selectedPOCs }
      data.users.forEach((user) => {
        if (!newPOCs[user.user_id]) {
          newPOCs[user.user_id] = POC_OPTIONS[0].value
        }
      })
      setSelectedPOCs(newPOCs)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M"
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  const handleSort = (key: keyof InstagramUser) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFollowerRange("all")
    setPocFilter("all")
    setSort({ key: "", direction: "asc" })
    setCurrentPage(1)
    fetchUsers(1)
  }

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) => user.username.toLowerCase().includes(term) || (user.email && user.email.toLowerCase().includes(term)),
      )
    }

    // Apply follower range filter
    if (followerRange !== "all") {
      const range = FOLLOWERS_RANGES.find((r) => r.value === followerRange)
      if (range) {
        filtered = filtered.filter((user) => user.followers_count >= range.min && user.followers_count < range.max)
      }
    }

   

    // Apply POC filter
    if (pocFilter !== "all") {
      filtered = filtered.filter((user) => selectedPOCs[user.user_id] === pocFilter)
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
  }, [users, searchTerm, followerRange, pocFilter, sort, selectedPOCs])

  const SortButton = ({ column }: { column: keyof InstagramUser }) => (
    <Button variant="ghost" onClick={() => handleSort(column)} className="h-8 px-2 hover:bg-muted">
      {sort.key === column ? (
        sort.direction === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4" />
      )}
    </Button>
  )

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Calculate range of visible pages
    let startPage = Math.max(2, currentPage - halfVisible)
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2)

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 2) {
      startPage = Math.max(2, endPage - maxVisiblePages + 2)
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <span className="px-4">...</span>
        </PaginationItem>,
      )
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <span className="px-4">...</span>
        </PaginationItem>,
      )
    }

    // Always show last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  const handleCheckboxChange = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredAndSortedUsers.map((user) => user.user_id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleScheduleCampaign = () => {
    console.log("Scheduling campaign for users:", selectedUsers)
    console.log(
      "POCs:",
      selectedUsers.map((userId) => ({
        userId,
        poc: selectedPOCs[userId],
      })),
    )
    setIsDialogOpen(false)
    setSelectedUsers([])
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Approved Leads</h1>
          <p className="text-sm text-muted-foreground">
            {selectedUsers.length} out of {totalCount} users selected
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={selectedUsers.length === 0}>Schedule Email Campaign ({selectedUsers.length})</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Email Campaign</DialogTitle>
              <DialogDescription>
                Are you sure you want to schedule an email campaign for {selectedUsers.length} selected users?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h4 className="mb-4 text-sm font-medium">Selected Users:</h4>
              <div className="max-h-[200px] overflow-auto space-y-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.user_id === userId)
                  if (!user) return null
                  const poc = POC_OPTIONS.find((p) => p.value === selectedPOCs[userId])
                  return (
                    <div key={userId} className="flex items-center justify-between text-sm">
                      <span>{user.username}</span>
                      <span className="text-muted-foreground">
                        POC: {poc?.label} ({poc?.email})
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleCampaign}>Confirm & Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex flex-wrap gap-4 border-b">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={followerRange} onValueChange={setFollowerRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Follower Range" />
              </SelectTrigger>
              <SelectContent>
                {FOLLOWERS_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
     
            <Select value={pocFilter} onValueChange={setPocFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by POC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All POCs</SelectItem>
                {POC_OPTIONS.map((poc) => (
                  <SelectItem key={poc.value} value={poc.value}>
                    {poc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>

          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredAndSortedUsers.length > 0 &&
                        filteredAndSortedUsers.every((user) => selectedUsers.includes(user.user_id))
                      }
                      onCheckedChange={handleSelectAllChange}
                    />
                  </TableHead>
                  <TableHead>
                    User ID
                    <SortButton column="user_id" />
                  </TableHead>
                  <TableHead>
                    Username
                    <SortButton column="username" />
                  </TableHead>
                  <TableHead>
                    Followers
                    <SortButton column="followers_count" />
                  </TableHead>
                  <TableHead>
                    Tier
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="h-4 w-4 p-0 ml-1">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-2">
                            <p>Gold: 1M+ followers</p>
                            <p>Silver: 100K - 1M followers</p>
                            <p>Bronze: 50K - 100K followers</p>
                            <p>Micro: Under 50K followers</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead>
                    Email
                    <SortButton column="email" />
                  </TableHead>
                 
                  <TableHead>Point of Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Loader />
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.user_id)}
                          onCheckedChange={() => handleCheckboxChange(user.user_id)}
                        />
                      </TableCell>
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>
                        <a
                          href={`https://instagram.com/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <Instagram className="h-4 w-4" />
                          {user.username}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatFollowers(user.followers_count)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="capitalize">{getTierFromFollowers(user.followers_count)}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {TIER_INFO[getTierFromFollowers(user.followers_count) as keyof typeof TIER_INFO]}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className={cn("h-4 w-4", user.email ? "text-green-500" : "text-muted-foreground")} />
                          {user.email || "No email"}
                        </div>
                      </TableCell>
                    
                      <TableCell>
                        <Select
                          value={selectedPOCs[user.user_id]}
                          onValueChange={(value) =>
                            setSelectedPOCs((prev) => ({
                              ...prev,
                              [user.user_id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {POC_OPTIONS.map((poc) => (
                              <SelectItem key={poc.value} value={poc.value}>
                                {poc.label} ({poc.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 flex items-center justify-between border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedUsers.length} of {totalCount} users
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

