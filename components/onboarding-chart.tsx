"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Onboarding Progress Over Time",
    },
  },
}

const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]

const data = {
  labels,
  datasets: [
    {
      label: "Completed",
      data: [10, 25, 45, 70, 95, 120],
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
    {
      label: "In Progress",
      data: [50, 80, 100, 110, 105, 90],
      borderColor: "rgb(54, 162, 235)",
      backgroundColor: "rgba(54, 162, 235, 0.5)",
    },
    {
      label: "Not Started",
      data: [200, 180, 150, 120, 100, 80],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
}

export function OnboardingChart() {
  return <Line options={options} data={data} />
}

