import { Loader2 } from "lucide-react"

export function Loader() {
  return (
    <div className="flex justify-center items-center w-full p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

