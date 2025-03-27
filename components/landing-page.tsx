"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { useAuth } from "@/hooks/use-auth"
import { CheckCircle, DollarSign, Users, PieChart } from "lucide-react"

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("login")
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Group Expenses",
      description: "Split expenses with friends and family easily",
    },
    {
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      title: "Settlement Tracking",
      description: "Record payments and track who owes what",
    },
    {
      icon: <PieChart className="h-6 w-6 text-primary" />,
      title: "Detailed Analytics",
      description: "Visualize spending patterns and categories",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">TripSplit</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" onClick={() => setActiveTab("login")}>
              Login
            </Button>
            <Button onClick={() => setActiveTab("signup")}>Sign Up</Button>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[1fr_400px] md:gap-6 lg:grid-cols-[1fr_350px] py-6">
        <div className="flex flex-col justify-center px-4 md:px-0 py-6 md:py-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Split expenses with friends <br className="hidden sm:inline" />
            <span className="text-primary">without the hassle</span>
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-[600px]">
            TripSplit makes it easy to track expenses, settle debts, and enjoy your trips without worrying about who
            paid for what.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold">How it works</h2>
            <div className="space-y-4">
              {[
                "Create a trip and add your friends",
                "Record expenses as they happen",
                "Track settlements and who owes what",
                "Get insights with detailed analytics",
              ].map((step, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2" />
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 md:mt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 TripSplit. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Privacy
            </Button>
            <Button variant="ghost" size="sm">
              Terms
            </Button>
            <Button variant="ghost" size="sm">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

