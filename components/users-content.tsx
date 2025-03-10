"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, CalendarIcon, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, Edit } from "lucide-react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { Loader } from "@/components/ui/loader"
import { Textarea } from "@/components/ui/textarea"

interface User {
  id: number
  user_id: number
  username: string
  name: string
  business_email: string
  referral: string | null
  poc: string
  poc_email_address: string
  first_email_status: string | null
  first_email_date: string | null
  first_email_time: string | null
  calendly_link_clicked: boolean
  calendly_click_date: string | null
  calendly_click_time: string | null
  onboarding_link_clicked: boolean
  onboarding_click_date: string | null
  onboarding_click_time: string | null
  replied: boolean
  follow_up_1_status: string | null
  follow_up_1_date: string | null
  follow_up_1_time: string | null
  follow_up_2_status: string | null
  follow_up_2_date: string | null
  follow_up_2_time: string | null
  video_call_status: string | null
  video_call_date: string | null
  onboarding_status: string | null
  onboarding_date: string | null
  notes: string | null
  hotjar_otter_links: string | null
  created_at: string
  updated_at: string
  email_reply_date: string | null
  email_reply_time: string | null
  reply_content: string | null
  unsubscribed: boolean
  unsubscribe_date: string | null
  unsubscribe_reason: string | null
}

interface ApiResponse {
  page: number
  limit: number
  total_count: string
  total_pages: number
  users: User[]
}

type SortConfig = {
  key: keyof User | ""
  direction: "asc" | "desc"
}

type DateRangeType = "custom" | "weekly" | "monthly" | null

export function UsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [emailStatusFilter, setEmailStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>(null)
  const [sort, setSort] = useState<SortConfig>({ key: "", direction: "asc" })
  const [repliedFilter, setRepliedFilter] = useState("all")
  const [calendlyFilter, setCalendlyFilter] = useState("all")
  const [onboardingFilter, setOnboardingFilter] = useState("all")
  const [unsubscribeFilter, setUnsubscribeFilter] = useState("all")
  const [videoCallFilter, setVideoCallFilter] = useState("all")
  const [followUpFilter, setFollowUpFilter] = useState("all")
  const [pocFilter, setPocFilter] = useState("")
  const [editing, setEditing] = useState<{ userId: number | null; field: 'notes' | 'links' | null }>({ 
    userId: null, 
    field: null 
  })
  const [editedNotes, setEditedNotes] = useState("")
  const [editedLinks, setEditedLinks] = useState("")

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`https://stir-email-outreach.onrender.com/api/outreach/users?page=${page}`)
      const data: ApiResponse = await response.json()
      setUsers(data.users)
      setTotalPages(data.total_pages)
      setTotalCount(Number.parseInt(data.total_count))
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: keyof User) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleDateRangeTypeChange = (type: DateRangeType) => {
    setDateRangeType(type)
    if (!type) {
      setDateRange(null)
      return
    }

    const today = new Date()
    let from: Date
    let to: Date

    switch (type) {
      case "weekly":
        from = startOfWeek(subWeeks(today, 1))
        to = endOfWeek(today)
        break
      case "monthly":
        from = startOfMonth(subMonths(today, 1))
        to = endOfMonth(today)
        break
      default:
        return
    }

    setDateRange({ from, to })
  }

  const resetFilters = () => {
    setFilter("")
    setEmailStatusFilter("all")
    setDateRange(null)
    setDateRangeType(null)
    setSort({ key: "", direction: "asc" })
    setCurrentPage(1)
    setRepliedFilter("all")
    setCalendlyFilter("all")
    setOnboardingFilter("all")
    setUnsubscribeFilter("all")
    setVideoCallFilter("all")
    setFollowUpFilter("all")
    setPocFilter("")
    fetchUsers(1)
  }

  const formatDateTime = (date: string | null, time: string | null) => {
    if (!date) return "N/A"
    try {
      const dateObj = new Date(`${date}T${time || "00:00:00.000Z"}`)
      if (isNaN(dateObj.getTime())) return "Invalid Date"
      return format(dateObj, "MMM dd, yyyy HH:mm")
    } catch (error) {
      return "Invalid Date"
    }
  }

  const handleSave = async (userId: number, field: 'notes' | 'hotjar_otter_links', value: string) => {
    try {
      const response = await fetch(`https://stir-email-outreach.onrender.com/api/outreach/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      })
      if (!response.ok) throw new Error('Failed to save')
      setUsers(users.map(user => user.id === userId ? { ...user, [field]: value } : user))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users]

    // Apply search filter
    if (filter) {
      const searchTerm = filter.toLowerCase()
      filtered = filtered.filter((user) =>
        Object.values(user).some((value) => value && value.toString().toLowerCase().includes(searchTerm)),
      )
    }

    // Apply email status filter
    if (emailStatusFilter !== "all") {
      filtered = filtered.filter((user) => user.first_email_status === emailStatusFilter)
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((user) => {
        const createdAt = new Date(user.created_at)
        return createdAt >= dateRange.from && createdAt <= dateRange.to
      })
    }

    // Apply reply status filter
    if (repliedFilter !== "all") {
      filtered = filtered.filter(user => repliedFilter === "replied" ? user.replied : !user.replied)
    }

    // Apply calendly filter
    if (calendlyFilter !== "all") {
      filtered = filtered.filter(user => calendlyFilter === "clicked" ? user.calendly_link_clicked : !user.calendly_link_clicked)
    }

    // Apply onboarding filter
    if (onboardingFilter !== "all") {
      filtered = filtered.filter(user => user.onboarding_status === onboardingFilter)
    }

    // Apply unsubscribe filter
    if (unsubscribeFilter !== "all") {
      filtered = filtered.filter(user => unsubscribeFilter === "unsubscribed" ? user.unsubscribed : !user.unsubscribed)
    }

    // Apply video call filter
    if (videoCallFilter !== "all") {
      filtered = filtered.filter(user => user.video_call_status === videoCallFilter)
    }

    // Apply follow-up filter
    if (followUpFilter !== "all") {
      filtered = filtered.filter(user => {
        if (followUpFilter === 'none') return !user.follow_up_1_status && !user.follow_up_2_status
        if (followUpFilter === 'follow_up_1') return !!user.follow_up_1_status
        if (followUpFilter === 'follow_up_2') return !!user.follow_up_2_status
        return true
      })
    }

    // Apply POC filter
    if (pocFilter) {
      filtered = filtered.filter(user => user.poc.toLowerCase().includes(pocFilter.toLowerCase()))
    }

    // Apply sorting
    if (sort.key) {
      filtered.sort((a, b) => {
        const aValue = a[sort.key]
        const bValue = b[sort.key]

        if (aValue === null) return sort.direction === "asc" ? -1 : 1
        if (bValue === null) return sort.direction === "asc" ? 1 : -1

        if (typeof aValue === "boolean") {
          return sort.direction === "asc"
            ? aValue === bValue
              ? 0
              : aValue
                ? 1
                : -1
            : aValue === bValue
              ? 0
              : aValue
                ? -1
                : 1
        }

        const comparison = String(aValue).localeCompare(String(bValue))
        return sort.direction === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [users, filter, emailStatusFilter, dateRange, sort, repliedFilter, calendlyFilter, 
      onboardingFilter, unsubscribeFilter, videoCallFilter, followUpFilter, pocFilter])

  const SortButton = ({ column }: { column: keyof User }) => (
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

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Approved Leads</h1>
        <div className="flex items-center gap-4">
          <Select
            value={dateRangeType || ""}
            onValueChange={(value: DateRangeType) => handleDateRangeTypeChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="weekly">Last Week</SelectItem>
              <SelectItem value="monthly">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {dateRangeType === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[240px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex flex-wrap gap-4 border-b">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={emailStatusFilter} onValueChange={setEmailStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Email Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Email Status</SelectItem>
                <SelectItem value="yet_to_schedule">Yet to Schedule</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={repliedFilter} onValueChange={setRepliedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Reply Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Replies</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="no_reply">No Reply</SelectItem>
              </SelectContent>
            </Select>
            <Select value={calendlyFilter} onValueChange={setCalendlyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Calendly Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Calendly Link Clicked</SelectItem>
                <SelectItem value="clicked">Clicked</SelectItem>
                <SelectItem value="not_clicked">Not Clicked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Onboarding Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Onboarding Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={unsubscribeFilter} onValueChange={setUnsubscribeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Subscription Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Unsubscribed</SelectItem>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by POC..."
              value={pocFilter}
              onChange={(e) => setPocFilter(e.target.value)}
              className="w-[180px]"
            />
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    User ID
                    <SortButton column="user_id" />
                  </TableHead>
                
                  <TableHead>
                    Email
                    <SortButton column="business_email" />
                  </TableHead>
                  <TableHead>
                    Username
                    <SortButton column="username" />
                  </TableHead>
                  <TableHead>
                    Referral
                    <SortButton column="referral" />
                  </TableHead>
                  <TableHead>
                    POC
                    <SortButton column="poc" />
                  </TableHead>
                  <TableHead>
                    First Email
                    <SortButton column="first_email_status" />
                  </TableHead>
                  <TableHead>
                    Calendly
                    <SortButton                     column="calendly_link_clicked" />
                  </TableHead>
                  <TableHead>
                    Onboarding
                    <SortButton column="onboarding_status" />
                  </TableHead>
                  <TableHead>Follow-ups</TableHead>
                  <TableHead>
                    Video Call
                    <SortButton column="video_call_status" />
                  </TableHead>
                  <TableHead>
                    Reply Status
                    <SortButton column="replied" />
                  </TableHead>
                  <TableHead>
                    Unsubscribe
                    <SortButton column="unsubscribed" />
                  </TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Links</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14}>
                      <Loader />
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-10">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.user_id}</TableCell>
                      <TableCell>{user.business_email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.referral || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{user.poc}</span>
                          <span className="text-sm text-muted-foreground">{user.poc_email_address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{user.first_email_status || "Not Set"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(user.first_email_date, user.first_email_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={user.calendly_link_clicked ? "text-green-600" : "text-muted-foreground"}>
                            {user.calendly_link_clicked ? "Clicked" : "Not Clicked"}
                          </span>
                          {user.calendly_link_clicked && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(user.calendly_click_date, user.calendly_click_time)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{user.onboarding_status || "Not Started"}</span>
                          {user.onboarding_date && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(user.onboarding_date, null)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>1: {user.follow_up_1_status || "N/A"}</span>
                          <span>2: {user.follow_up_2_status || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{user.video_call_status || "Not Scheduled"}</span>
                          {user.video_call_date && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(user.video_call_date, null)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={user.replied ? "text-green-600" : "text-muted-foreground"}>
                            {user.replied ? "Replied" : "No Reply"}
                          </span>
                          {user.replied && user.email_reply_date && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(user.email_reply_date, user.email_reply_time)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={user.unsubscribed ? "text-red-600" : "text-green-600"}>
                            {user.unsubscribed ? "Unsubscribed" : "Subscribed"}
                          </span>
                          {user.unsubscribed && user.unsubscribe_date && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(user.unsubscribe_date, null)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editing.userId === user.id && editing.field === 'notes' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editedNotes}
                              onChange={(e) => setEditedNotes(e.target.value)}
                              className="w-[200px]"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                handleSave(user.id, 'notes', editedNotes)
                                setEditing({ userId: null, field: null })
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="max-w-[200px] truncate">{user.notes || 'No notes'}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditedNotes(user.notes || '')
                                setEditing({ userId: user.id, field: 'notes' })
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editing.userId === user.id && editing.field === 'links' ? (
                          <div className="flex gap-2">
                            <Input
                              value={editedLinks}
                              onChange={(e) => setEditedLinks(e.target.value)}
                              className="w-[300px]"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                handleSave(user.id, 'hotjar_otter_links', editedLinks)
                                setEditing({ userId: null, field: null })
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {user.hotjar_otter_links ? (
                              <>
                                <ExternalLink className="h-4 w-4" />
                                <a
                                  href={user.hotjar_otter_links}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate underline max-w-[200px]"
                                >
                                  {user.hotjar_otter_links}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditedLinks(user.hotjar_otter_links || '')
                                    setEditing({ userId: user.id, field: 'links' })
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  value={editedLinks}
                                  onChange={(e) => setEditedLinks(e.target.value)}
                                  className="w-[200px]"
                                  placeholder="Add link..."
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleSave(user.id, 'hotjar_otter_links', editedLinks)
                                    setEditing({ userId: null, field: null })
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
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
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}