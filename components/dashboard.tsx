"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { EmptyTrips } from "@/components/empty-trips"
import { TripCard } from "@/components/trip-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { useTrips } from "@/hooks/use-trips"

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false)
  const { trips, isLoading: isTripsLoading } = useTrips()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="My Trips" text="Create and manage your trips here.">
        <Button onClick={() => setIsCreateTripOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </DashboardHeader>

      {isTripsLoading ? (
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </div>
      ) : trips.length === 0 ? (
        <EmptyTrips />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      <CreateTripDialog open={isCreateTripOpen} onOpenChange={setIsCreateTripOpen} />
    </DashboardShell>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}

