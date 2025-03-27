import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import TravelAssistant from "@/components/travel-assistant"

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <TravelAssistant />
      </Suspense>
    </main>
  )
}

