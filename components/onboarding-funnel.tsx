"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface FunnelData {
  first_email_sent: number
  email_opened: number
  calendly_clicked: number
  video_call_completed: number
  onboarding_completed: number
}

export function OnboardingFunnel() {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)

  useEffect(() => {
    fetch("/api/onboarding-funnel")
      .then((response) => response.json())
      .then((data) => setFunnelData(data))
  }, [])

  if (!funnelData) {
    return <div>Loading...</div>
  }

  const data = {
    labels: ["Emails Sent", "Emails Opened", "Calendly Clicked", "Video Call Completed", "Onboarding Completed"],
    datasets: [
      {
        label: "Users",
        data: [
          funnelData.first_email_sent,
          funnelData.email_opened,
          funnelData.calendly_clicked,
          funnelData.video_call_completed,
          funnelData.onboarding_completed,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  }

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Onboarding Funnel",
      },
    },
  }

  return <Bar data={data} options={options} />
}

