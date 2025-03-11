"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  Download,
  Filter,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { RecentActivity } from "@/components/recent-activity";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default stats
const defaultStats = {
  totalEmailsSent: 0,
  totalEmailsOpened: 0,
  totalReplies: 0,
  totalCalendlyClicked: 0,
  totalVideoCallsScheduled: 0,
  totalVideoCallsCompleted: 0,
  totalOnboardingLinkClicked: 0,
  totalOnboardingStarted: 0,
  totalOnboarded: 0,
  totalUnsubscribed: 0,
};

// Time range options
const TIME_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "last3months", label: "Last 3 Months" },
  { value: "last6months", label: "Last 6 Months" },
  { value: "lastYear", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

export function DashboardContent() {
  const [timeRange, setTimeRange] = useState("last7days");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null
  );
  const [currentStats, setCurrentStats] = useState(defaultStats);
  const [pocFilter, setPocFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [emailChartType, setEmailChartType] = useState("line");
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [smoothing, setSmoothing] = useState(0.4);
  const [chartTimeRange, setChartTimeRange] = useState("weekly");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showVolume, setShowVolume] = useState(false);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [movingAveragePeriod, setMovingAveragePeriod] = useState(7);
  const [timeFilter, setTimeFilter] = useState<{ from: string; to: string }>({
    from: "00:00",
    to: "23:59",
  });
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pocOptions, setPocOptions] = useState([
    { value: "all", label: "All POCs" },
  ]);
  const [tierOptions, setTierOptions] = useState([
    { value: "all", label: "All Tiers" },
  ]);
  const [recentActivityData, setRecentActivityData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch POC and Tier options when component mounts
    const fetchFilterOptions = async () => {
      try {
        const [pocsResponse, tiersResponse] = await Promise.all([
          axios.get("http://localhost:3007/api/dashboard/pocs"),
          axios.get("http://localhost:3007/api/dashboard/tiers"),
        ]);

        setPocOptions(pocsResponse.data);
        setTierOptions(tiersResponse.data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // Set default date range based on timeRange
    if (timeRange !== "custom") {
      const today = new Date();
      let from: Date;
      let to: Date = endOfDay(today);

      switch (timeRange) {
        case "today":
          from = startOfDay(today);
          break;
        case "yesterday":
          from = startOfDay(subDays(today, 1));
          to = endOfDay(subDays(today, 1));
          break;
        case "last7days":
          from = startOfDay(subDays(today, 6));
          break;
        case "last30days":
          from = startOfDay(subDays(today, 29));
          break;
        case "thisMonth":
          from = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
          break;
        case "lastMonth":
          from = startOfDay(
            new Date(today.getFullYear(), today.getMonth() - 1, 1)
          );
          to = endOfDay(new Date(today.getFullYear(), today.getMonth(), 0));
          break;
        case "last3months":
          from = startOfDay(
            new Date(today.getFullYear(), today.getMonth() - 3, 1)
          );
          break;
        case "last6months":
          from = startOfDay(
            new Date(today.getFullYear(), today.getMonth() - 6, 1)
          );
          break;
        case "lastYear":
          from = startOfDay(
            new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          );
          break;
        default:
          from = startOfDay(subDays(today, 6));
      }

      setDateRange({ from, to });

      // Also update the chart time range based on the selected time range
      if (timeRange === "today" || timeRange === "yesterday") {
        setChartTimeRange("daily");
      } else if (
        timeRange === "last7days" ||
        timeRange === "last30days" ||
        timeRange === "thisMonth" ||
        timeRange === "lastMonth"
      ) {
        setChartTimeRange("weekly");
      } else {
        setChartTimeRange("monthly");
      }
    }
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      let url = "/api/dashboard?";

      // Add query parameters
      const params = new URLSearchParams();
      params.append("timeRange", timeRange);
      params.append("chartTimeRange", chartTimeRange);
      params.append("poc", pocFilter);
      params.append("tier", tierFilter);
      params.append("timeFilterFrom", timeFilter.from);
      params.append("timeFilterTo", timeFilter.to);

      // Add date range if custom
      if (timeRange === "custom" && dateRange?.from && dateRange?.to) {
        params.append("dateFrom", format(dateRange.from, "yyyy-MM-dd"));
        params.append("dateTo", format(dateRange.to, "yyyy-MM-dd"));
      }

      const response = await axios.get(
        `http://localhost:3007/api/dashboard?${params.toString()}`
      );

      // Update state with API response
      setCurrentStats(response.data.stats);
      setTimeSeriesData(response.data.timeSeriesData);
      setRecentActivityData(response.data.recentActivity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if we have a date range or if we're not using custom time range
    if (
      timeRange !== "custom" ||
      (timeRange === "custom" && dateRange?.from && dateRange?.to)
    ) {
      fetchDashboardData();
    }
  }, [
    timeRange,
    chartTimeRange,
    pocFilter,
    tierFilter,
    timeFilter.from,
    timeFilter.to,
  ]);

  const resetFilters = () => {
    setTimeRange("last7days");
    setDateRange(null);
    setPocFilter("all");
    setTierFilter("all");
    setChartTimeRange("weekly");
    setTimeFilter({ from: "00:00", to: "23:59" });
  };

  const data = timeSeriesData || [];

  const labels = data.map(
    (item) => item.hour || item.day || item.week || item.month
  );

  // Calculate moving averages
  const calculateMovingAverage = (data: number[], period: number) => {
    return data.map((_, index) => {
      if (index < period - 1) return null;
      const slice = data.slice(index - period + 1, index + 1);
      return slice.reduce((sum, val) => sum + val, 0) / period;
    });
  };

  // Email metrics chart data
  const emailMetricsData = {
    labels,
    datasets: [
      {
        label: "Emails Sent",
        data: data.map((item) => item.emailsSent),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      {
        label: "Replies",
        data: data.map((item) => item.replies),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      {
        label: "Unsubscribed",
        data: data.map((item) => item.unsubscribed),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      ...(showMovingAverage && data.length >= movingAveragePeriod
        ? [
            {
              label: `${movingAveragePeriod}-Period MA (Emails Sent)`,
              data: calculateMovingAverage(
                data.map((item) => item.emailsSent),
                movingAveragePeriod
              ),
              borderColor: "rgba(53, 162, 235, 0.8)",
              backgroundColor: "transparent",
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              tension: 0.4,
              fill: false,
            },
          ]
        : []),
    ],
  };

  // Calendly metrics chart data
  const calendlyMetricsData = {
    labels,
    datasets: [
      {
        label: "Calendly Clicked",
        data: data.map((item) => item.calendlyClicked),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      {
        label: "Video Calls Scheduled",
        data: data.map((item) => item.videoCallsScheduled),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      {
        label: "Video Calls Completed",
        data: data.map((item) => item.videoCallsCompleted),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
    ],
  };

  // Onboarding metrics chart data
  const onboardingMetricsData = {
    labels,
    datasets: [
      {
        label: "Onboarding Link Clicked",
        data: data.map((item) => item.onboardingLinkClicked),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      {
        label: "Onboarding Started",
        data: data.map((item) => item.onboardingStarted),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
      {
        label: "Users Onboarded",
        data: data.map((item) => item.onboarded),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: smoothing,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: showVolume,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
      datalabels: {
        display: showDataLabels,
        color: "#000",
        align: "top" as const,
        formatter: (value: number) => value,
      },
    },
    scales: {
      x: {
        grid: {
          display: showGridLines,
        },
      },
      y: {
        grid: {
          display: showGridLines,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: smoothing,
      },
    },
  };

  const handleApplyDateFilter = () => {
    if (timeRange === "custom" && dateRange?.from && dateRange?.to) {
      fetchDashboardData();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleSmoothingChange = (value: number[]) => {
    setSmoothing(value[0] / 100);
  };

  const handleMovingAveragePeriodChange = (value: number[]) => {
    setMovingAveragePeriod(value[0]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {timeRange === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Custom date range</span>
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

          <Select value={pocFilter} onValueChange={setPocFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="POC" />
            </SelectTrigger>
            <SelectContent>
              {pocOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              {tierOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleApplyDateFilter}
            disabled={
              (timeRange === "custom" &&
                (!dateRange?.from || !dateRange?.to)) ||
              isLoading
            }
          >
            {isLoading ? "Loading..." : "Apply Filter"}
          </Button>

          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {pocFilter !== "all" && (
          <Badge variant="outline" className="px-3 py-1">
            POC: {pocOptions.find((p) => p.value === pocFilter)?.label}
          </Badge>
        )}
        {tierFilter !== "all" && (
          <Badge variant="outline" className="px-3 py-1">
            Tier: {tierOptions.find((t) => t.value === tierFilter)?.label}
          </Badge>
        )}
        {timeRange !== "last7days" && (
          <Badge variant="outline" className="px-3 py-1">
            Time: {TIME_RANGE_OPTIONS.find((t) => t.value === timeRange)?.label}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalEmailsSent.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalReplies.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Replies (
                  {currentStats.totalEmailsSent
                    ? (
                        (currentStats.totalReplies /
                          currentStats.totalEmailsSent) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalUnsubscribed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unsubscribed (
                  {currentStats.totalEmailsSent
                    ? (
                        (currentStats.totalUnsubscribed /
                          currentStats.totalEmailsSent) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calendly Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalCalendlyClicked.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clicked (
                  {currentStats.totalEmailsSent
                    ? (
                        (currentStats.totalCalendlyClicked /
                          currentStats.totalEmailsSent) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalVideoCallsScheduled.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled (
                  {currentStats.totalCalendlyClicked
                    ? (
                        (currentStats.totalVideoCallsScheduled /
                          currentStats.totalCalendlyClicked) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalVideoCallsCompleted.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed (
                  {currentStats.totalVideoCallsScheduled
                    ? (
                        (currentStats.totalVideoCallsCompleted /
                          currentStats.totalVideoCallsScheduled) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Onboarding Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalOnboardingLinkClicked.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Link Clicked (
                  {currentStats.totalEmailsSent
                    ? (
                        (currentStats.totalOnboardingLinkClicked /
                          currentStats.totalEmailsSent) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalOnboardingStarted.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Started (
                  {currentStats.totalOnboardingLinkClicked
                    ? (
                        (currentStats.totalOnboardingStarted /
                          currentStats.totalOnboardingLinkClicked) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentStats.totalOnboarded.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed (
                  {currentStats.totalOnboardingStarted
                    ? (
                        (currentStats.totalOnboarded /
                          currentStats.totalOnboardingStarted) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="email">Email Metrics</TabsTrigger>
            <TabsTrigger value="calendly">Calendly Metrics</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding Metrics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <Select value={chartTimeRange} onValueChange={setChartTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Chart Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            {chartTimeRange === "hourly" && (
              <div className="flex items-center gap-2">
                <Select
                  value={timeFilter.from}
                  onValueChange={(value) =>
                    setTimeFilter((prev) => ({ ...prev, from: value }))
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="From" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const hour = `${String(i).padStart(2, "0")}:00`;
                      return (
                        <SelectItem key={`from-${hour}`} value={hour}>
                          {hour}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <span>to</span>
                <Select
                  value={timeFilter.to}
                  onValueChange={(value) =>
                    setTimeFilter((prev) => ({ ...prev, to: value }))
                  }
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="To" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const hour = `${String(i).padStart(2, "0")}:00`;
                      return (
                        <SelectItem key={`to-${hour}`} value={hour}>
                          {hour}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Chart Options
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Chart Type</h4>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={
                          emailChartType === "line" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setEmailChartType("line")}
                      >
                        Line
                      </Button>
                      <Button
                        variant={
                          emailChartType === "bar" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setEmailChartType("bar")}
                      >
                        Bar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-data-labels">Show Data Labels</Label>
                      <Switch
                        id="show-data-labels"
                        checked={showDataLabels}
                        onCheckedChange={setShowDataLabels}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-grid-lines">Show Grid Lines</Label>
                      <Switch
                        id="show-grid-lines"
                        checked={showGridLines}
                        onCheckedChange={setShowGridLines}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-legend">Show Legend</Label>
                      <Switch
                        id="show-legend"
                        checked={showLegend}
                        onCheckedChange={setShowLegend}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-volume">Show Area Fill</Label>
                      <Switch
                        id="show-volume"
                        checked={showVolume}
                        onCheckedChange={setShowVolume}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-ma">Show Moving Average</Label>
                      <Switch
                        id="show-ma"
                        checked={showMovingAverage}
                        onCheckedChange={setShowMovingAverage}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Line Smoothing</h4>
                    <Slider
                      defaultValue={[smoothing * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleSmoothingChange}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span>
                      <span>Max</span>
                    </div>
                  </div>

                  {showMovingAverage && (
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">
                        Moving Average Period: {movingAveragePeriod}
                      </h4>
                      <Slider
                        defaultValue={[movingAveragePeriod]}
                        min={2}
                        max={20}
                        step={1}
                        onValueChange={handleMovingAveragePeriodChange}
                      />
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{zoomLevel}%</span>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="icon" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <p>Loading chart data...</p>
                </div>
              ) : data.length > 0 ? (
                <div style={{ height: `${350 * (zoomLevel / 100)}px` }}>
                  {emailChartType === "line" ? (
                    <Line data={emailMetricsData} options={chartOptions} />
                  ) : (
                    <Bar data={emailMetricsData} options={chartOptions} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p>No data available for the selected filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendly">
          <Card>
            <CardHeader>
              <CardTitle>Calendly Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <p>Loading chart data...</p>
                </div>
              ) : data.length > 0 ? (
                <div style={{ height: `${350 * (zoomLevel / 100)}px` }}>
                  {emailChartType === "line" ? (
                    <Line data={calendlyMetricsData} options={chartOptions} />
                  ) : (
                    <Bar data={calendlyMetricsData} options={chartOptions} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p>No data available for the selected filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <p>Loading chart data...</p>
                </div>
              ) : data.length > 0 ? (
                <div style={{ height: `${350 * (zoomLevel / 100)}px` }}>
                  {emailChartType === "line" ? (
                    <Line data={onboardingMetricsData} options={chartOptions} />
                  ) : (
                    <Bar data={onboardingMetricsData} options={chartOptions} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p>No data available for the selected filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <RecentActivity activities={recentActivityData} />
      </Card>
    </div>
  );
}
