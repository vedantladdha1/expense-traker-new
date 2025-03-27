"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useTrips } from "@/hooks/use-trips"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Calendar, DollarSign, Users } from "lucide-react"

export default function UserProfile() {
  const { user, isLoading } = useAuth()
  const { trips } = useTrips()
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      return
    }

    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const totalTrips = trips.length
  const totalExpenses = trips.reduce((sum, trip) => sum + (trip.totalExpenses || 0), 0)
  const upcomingTrips = trips.filter((trip) => trip.startDate && new Date(trip.startDate) > new Date()).length

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile in the backend
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
    setIsEditing(false)
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="My Profile" text="View and manage your profile information." />

      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-1/3">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  <span className="text-2xl font-bold">{totalTrips}</span>
                  <span className="text-sm text-muted-foreground">Trips</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  <span className="text-2xl font-bold">{upcomingTrips}</span>
                  <span className="text-sm text-muted-foreground">Upcoming</span>
                </div>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <span className="text-xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(totalExpenses)}
                </span>
                <span className="text-sm text-muted-foreground">Total Expenses</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardFooter>
          </Card>

          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trips">Trip History</TabsTrigger>
                <TabsTrigger value="settings">Account Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      {isEditing ? "Edit your profile information below" : "Your personal information and preferences"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Member Since</span>
                          <span className="font-medium">March 2025</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {isEditing && (
                    <CardFooter>
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="trips" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trip History</CardTitle>
                    <CardDescription>All the trips you've created or participated in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trips.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">You haven't created any trips yet</p>
                    ) : (
                      <div className="space-y-4">
                        {trips.map((trip) => (
                          <div
                            key={trip.id}
                            className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                            onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                          >
                            <div>
                              <h3 className="font-medium">{trip.name}</h3>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>
                                  {trip.startDate && trip.endDate
                                    ? `${format(new Date(trip.startDate), "MMM d")} - ${format(new Date(trip.endDate), "MMM d, yyyy")}`
                                    : "No dates set"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-sm">{trip.memberCount || 0}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="text-sm">{trip.totalExpenses?.toLocaleString() || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Change Password</Label>
                      <Input id="password" type="password" placeholder="New password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

