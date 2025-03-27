"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import type { Trip } from "@/types"
import { useRouter } from "next/navigation"
import { Calendar, Users, DollarSign } from "lucide-react"

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter()

  const formatDateRange = () => {
    if (!trip.startDate || !trip.endDate) return "No dates set"

    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`
    }

    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
    }

    return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>{trip.name}</CardTitle>
        <CardDescription>
          <div className="flex items-center mt-1 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDateRange()}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{trip.memberCount || 0} people</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {trip.currency} {trip.totalExpenses?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        {trip.description && <p className="text-sm text-muted-foreground line-clamp-2">{trip.description}</p>}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="default" className="w-full" onClick={() => router.push(`/dashboard/trips/${trip.id}`)}>
          View Trip
        </Button>
      </CardFooter>
    </Card>
  )
}

