"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Trip } from "@/types"
import { useExpenses } from "@/hooks/use-expenses"
import { usePeople } from "@/hooks/use-people"
import { CATEGORIES } from "@/lib/constants"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

interface AnalyticsTabProps {
  trip: Trip
}

export function AnalyticsTab({ trip }: AnalyticsTabProps) {
  const [activeTab, setActiveTab] = useState("categories")
  const { expenses } = useExpenses(trip.id)
  const { people } = usePeople(trip.id)

  // Calculate category totals
  const calculateCategoryTotals = () => {
    const categoryTotals: Record<string, number> = {}
    let totalAmount = 0

    // Sum expenses by category
    expenses.forEach((expense) => {
      const category = expense.category || "other"
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
      totalAmount += expense.amount
    })

    // Convert to array with percentages
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        name: CATEGORIES.find((cat) => cat.id === category)?.name || "Other",
        icon: CATEGORIES.find((cat) => cat.id === category)?.icon || "📦",
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Calculate person totals
  const calculatePersonTotals = () => {
    const personTotals: Record<string, number> = {}

    // Initialize totals to 0
    people.forEach((person) => {
      personTotals[person.id] = 0
    })

    // Sum expenses by person
    expenses.forEach((expense) => {
      personTotals[expense.payerId] = (personTotals[expense.payerId] || 0) + expense.amount
    })

    // Calculate total expenses
    const totalExpenses = Object.values(personTotals).reduce((sum, amount) => sum + amount, 0)

    // Convert to array with percentages
    return Object.entries(personTotals)
      .map(([personId, amount]) => ({
        personId,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        name: people.find((p) => p.id === personId)?.name || "Unknown",
        color: people.find((p) => p.id === personId)?.color || "bg-gray-500",
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: trip.currency,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const categoryTotals = calculateCategoryTotals()
  const personTotals = calculatePersonTotals()

  // Colors for the pie chart
  const COLORS = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#f43f5e", // rose-500
    "#84cc16", // lime-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
  ]

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <div className="flex items-center gap-2">
            {data.icon && <span>{data.icon}</span>}
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="mt-1">
            <span className="font-bold">{formatCurrency(data.amount)}</span>
            <span className="text-muted-foreground ml-1">({data.percentage.toFixed(1)}%)</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="people">By Person</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="categories" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
            <CardDescription>See how your expenses are distributed across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {categoryTotals.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(category.amount)}</span>
                        <span className="text-muted-foreground text-sm ml-2">({category.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center h-[300px]">
                {categoryTotals.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryTotals}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">No expense data available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="people" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Person</CardTitle>
            <CardDescription>See how expenses are distributed among people</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {personTotals.map((person) => (
                  <div key={person.personId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                        <span>{person.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(person.amount)}</span>
                        <span className="text-muted-foreground text-sm ml-2">({person.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <Progress value={person.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center h-[300px]">
                {personTotals.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personTotals}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="name"
                      >
                        {personTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground">No expense data available</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  )
}

