import { Activity, Calendar, MessageSquare, UserCheck } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"

interface User {
  name: string
  email: string
}

interface ActivityItem {
  id: string
  type: "email_sent" | "email_replied" | "video_call" | "onboarding" | "unsubscribe"
  user: User
  poc: string
  timestamp: string
  message: string
  content?: string
  status?: string
  reason?: string
}

const getTierColor = (poc: string) => {
  // This is a simplified mapping - in reality you might want a more robust approach
  // or fetch tier information from the API
  const pocToTierMap: Record<string, string> = {
    "Yug": "gold",
    "Ankur": "silver", 
    "Akshat": "bronze"
  }
  
  const tier = pocToTierMap[poc] || "micro"
  
  switch (tier) {
    case "gold":
      return "bg-yellow-500"
    case "silver":
      return "bg-gray-400"
    case "bronze":
      return "bg-amber-600"
    default:
      return "bg-blue-500"
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "email_sent":
    case "email_replied":
      return <MessageSquare className="h-5 w-5 text-white" />
    case "video_call":
      return <Calendar className="h-5 w-5 text-white" />
    case "onboarding":
      return <UserCheck className="h-5 w-5 text-white" />
    default:
      return <Activity className="h-5 w-5 text-white" />
  }
}

const ActivityList = ({ activities }: { activities: ActivityItem[] }) => (
  <div className="space-y-8">
    {activities.length > 0 ? (
      activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <div className={`h-8 w-8 rounded-full ${getTierColor(activity.poc)} flex items-center justify-center`}>
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium text-foreground">{activity.user.name}</p>
            <p className="text-sm text-muted-foreground">{activity.message}</p>
            {activity.content && (
              <p className="text-xs text-muted-foreground mt-1 italic">"{activity.content.substring(0, 50)}..."</p>
            )}
            {activity.reason && (
              <p className="text-xs text-muted-foreground mt-1">Reason: {activity.reason}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              {/* {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })} */}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8 text-muted-foreground">No recent activities found</div>
    )}
  </div>
)

export function RecentActivity({ activities = [] }: { activities?: ActivityItem[] }) {
  const [activeTab, setActiveTab] = useState("all")
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>(activities)

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredActivities(activities)
    } else {
      let filtered: ActivityItem[] = []
      
      switch (activeTab) {
        case "calendly":
          filtered = activities.filter(a => a.type === "video_call")
          break
        case "onboarding":
          filtered = activities.filter(a => a.type === "onboarding")
          break
        case "replies":
          filtered = activities.filter(a => a.type === "email_replied" || a.type === "unsubscribe")
          break
        default:
          filtered = activities
      }
      
      setFilteredActivities(filtered)
    }
  }, [activeTab, activities])

  return (
    <>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full grid grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="calendly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendly</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="replies" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Replies</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ActivityList activities={filteredActivities} />
          </TabsContent>

          <TabsContent value="calendly">
            <ActivityList activities={filteredActivities} />
          </TabsContent>

          <TabsContent value="onboarding">
            <ActivityList activities={filteredActivities} />
          </TabsContent>

          <TabsContent value="replies">
            <ActivityList activities={filteredActivities} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  )
}