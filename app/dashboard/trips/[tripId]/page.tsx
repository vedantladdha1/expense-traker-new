import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import TripDetail from "@/components/trip-detail"

interface TripDetailPageProps {
  params: {
    tripId: string
  }
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <TripDetail tripId={params.tripId} />
      </Suspense>
    </main>
  )
}

