import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    onboardingStatus: "Completed",
    videoCallDate: "2023-05-15",
    emailOpened: true,
    calendlyClicked: true,
    onboardingLinkClicked: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    onboardingStatus: "In Progress",
    videoCallDate: "2023-05-20",
    emailOpened: true,
    calendlyClicked: true,
    onboardingLinkClicked: false,
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    onboardingStatus: "Not Started",
    videoCallDate: "N/A",
    emailOpened: true,
    calendlyClicked: false,
    onboardingLinkClicked: false,
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    onboardingStatus: "In Progress",
    videoCallDate: "2023-05-22",
    emailOpened: true,
    calendlyClicked: true,
    onboardingLinkClicked: true,
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie@example.com",
    onboardingStatus: "Not Started",
    videoCallDate: "N/A",
    emailOpened: false,
    calendlyClicked: false,
    onboardingLinkClicked: false,
  },
]

export function UserTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Onboarding Status</TableHead>
          <TableHead>Video Call Date</TableHead>
          <TableHead>Email Opened</TableHead>
          <TableHead>Calendly Clicked</TableHead>
          <TableHead>Onboarding Link Clicked</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.onboardingStatus}</TableCell>
            <TableCell>{user.videoCallDate}</TableCell>
            <TableCell>{user.emailOpened ? "Yes" : "No"}</TableCell>
            <TableCell>{user.calendlyClicked ? "Yes" : "No"}</TableCell>
            <TableCell>{user.onboardingLinkClicked ? "Yes" : "No"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

