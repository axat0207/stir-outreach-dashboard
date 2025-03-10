import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Static data to simulate database response
  const funnelData = {
    first_email_sent: 1000,
    email_opened: 800,
    calendly_clicked: 600,
    video_call_completed: 400,
    onboarding_completed: 300,
  }

  return NextResponse.json(funnelData)
}

