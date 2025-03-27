"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useTrips } from "@/hooks/use-trips"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import type { Trip } from "@/types"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Users, DollarSign, Settings, PlusCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PeopleTab } from "@/components/trip-tabs/people-tab"
import { ExpensesTab } from "@/components/trip-tabs/expenses-tab"
import { SettlementsTab } from "@/components/trip-tabs/settlements-tab"
import { SummaryTab } from "@/components/trip-tabs/summary-tab"
import { AnalyticsTab } from "@/components/trip-tabs/analytics-tab"

interface TripDetailProps {
  tripId: string
}

export default function TripDetail({ tripId }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [activeTab, setActiveTab] = useState("people")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getTrip } = useTrips()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/")
      return
    }

    const loadTrip = () => {
      console.log("Loading trip with ID:", tripId)
      setIsLoading(true)
      setError(null)

      try {
        // Try to get the trip
        const tripData = getTrip(tripId)

        if (tripData) {
          console.log("Trip found:", tripData)
          setTrip(tripData)
          setIsLoading(false)
        } else {
          console.error("Trip not found with ID:", tripId)
          setError("Trip not found")
          setIsLoading(false)

          toast({
            title: "Trip not found",
            description: "The requested trip could not be found. Redirecting to dashboard...",
            variant: "destructive",
          })

          // Redirect after a short delay
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        }
      } catch (err) {
        console.error("Error loading trip:", err)
        setError("Error loading trip")
        setIsLoading(false)

        toast({
          title: "Error",
          description: "There was an error loading the trip. Please try again.",
          variant: "destructive",
        })
      }
    }

    // Add a small delay to ensure localStorage is loaded
    const timer = setTimeout(loadTrip, 300)
    return () => clearTimeout(timer)
  }, [tripId, getTrip, user, isAuthLoading, router, toast])

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading trip details...</p>
        </div>
      </DashboardShell>
    )
  }

  if (error || !trip) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="text-destructive text-xl font-bold mb-4">Trip not found</div>
          <p className="text-muted-foreground mb-6">The requested trip could not be found or has been deleted.</p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </DashboardShell>
    )
  }

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

  const budgetProgress = trip.budget ? (trip.totalExpenses / trip.budget) * 100 : 0
  const isOverBudget = trip.budget ? trip.totalExpenses > trip.budget : false

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            {trip.description && <p className="text-muted-foreground mt-1">{trip.description}</p>}
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDateRange()}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{trip.memberCount || 0} people</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{trip.currency}</span>
              </Badge>
            </div>
          </div>

          {trip.budget && (
            <Card className="w-full md:w-72">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <CardDescription>{isOverBudget ? "Over budget" : "Budget remaining"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{trip.totalExpenses.toLocaleString()} spent</span>
                  <span className={`text-sm font-medium ${isOverBudget ? "text-destructive" : "text-primary"}`}>
                    {isOverBudget ? "+" : ""}
                    {Math.abs(trip.totalExpenses - trip.budget).toLocaleString()} {isOverBudget ? "over" : "left"}
                  </span>
                </div>
                <Progress
                  value={Math.min(budgetProgress, 100)}
                  className="h-2"
                  indicatorClassName={isOverBudget ? "bg-destructive" : undefined}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs">0</span>
                  <span className="text-xs">{trip.budget.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="people" className="flex items-center gap-1">
              <Users className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="settlements" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Settlements</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <Settings className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people">
            <PeopleTab trip={trip} />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpensesTab trip={trip} />
          </TabsContent>

          <TabsContent value="settlements">
            <SettlementsTab trip={trip} />
          </TabsContent>

          <TabsContent value="summary">
            <SummaryTab trip={trip} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab trip={trip} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

