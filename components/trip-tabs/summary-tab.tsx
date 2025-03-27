"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Trip } from "@/types"
import { ArrowRight, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useExpenses } from "@/hooks/use-expenses"
import { usePeople } from "@/hooks/use-people"
import { useSettlements } from "@/hooks/use-settlements"
import { useToast } from "@/hooks/use-toast"

interface SummaryTabProps {
  trip: Trip
}

export function SummaryTab({ trip }: SummaryTabProps) {
  const { expenses } = useExpenses(trip.id)
  const { people } = usePeople(trip.id)
  const { settlements } = useSettlements(trip.id)
  const { toast } = useToast()

  // Calculate balances
  const calculateBalances = () => {
    const balances: Record<string, number> = {}

    // Initialize balances to 0
    people.forEach((person) => {
      balances[person.id] = 0
    })

    // Calculate what each person paid
    expenses.forEach((expense) => {
      // Add the amount to the payer
      balances[expense.payerId] += expense.amount

      // Calculate each person's share based on split type
      if (expense.splitType === "equal") {
        const perPersonShare = expense.amount / expense.participants.length

        // Subtract the share from each participant
        expense.participants.forEach((participantId) => {
          balances[participantId] -= perPersonShare
        })
      } else if (expense.splitType === "percentage" && expense.customSplits) {
        // Calculate based on percentage splits
        expense.participants.forEach((participantId) => {
          const percentage = expense.customSplits?.[participantId] || 0
          const share = (expense.amount * percentage) / 100
          balances[participantId] -= share
        })
      } else if (expense.splitType === "custom" && expense.customSplits) {
        // Custom amounts are already stored directly
        expense.participants.forEach((participantId) => {
          const customAmount = expense.customSplits?.[participantId] || 0
          balances[participantId] -= customAmount
        })
      }
    })

    // Apply settlements
    settlements.forEach((settlement) => {
      balances[settlement.fromPersonId] -= settlement.amount
      balances[settlement.toPersonId] += settlement.amount
    })

    return balances
  }

  // Calculate settlement plan
  const calculateSettlement = () => {
    const balances = calculateBalances()
    const settlement: { from: string; to: string; amount: number }[] = []

    // Create arrays of debtors and creditors
    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .map(([id, balance]) => ({ id, balance: Math.abs(balance) }))
      .sort((a, b) => b.balance - a.balance)

    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .map(([id, balance]) => ({ id, balance }))
      .sort((a, b) => b.balance - a.balance)

    // Match debtors with creditors
    debtors.forEach((debtor) => {
      let remainingDebt = debtor.balance

      while (remainingDebt > 0.01 && creditors.length > 0) {
        const creditor = creditors[0]

        if (creditor.balance <= remainingDebt) {
          // Creditor's balance is less than or equal to the remaining debt
          settlement.push({
            from: debtor.id,
            to: creditor.id,
            amount: Number(creditor.balance.toFixed(2)),
          })

          remainingDebt -= creditor.balance
          creditors.shift() // Remove the creditor as they've been fully paid
        } else {
          // Creditor's balance is more than the remaining debt
          settlement.push({
            from: debtor.id,
            to: creditor.id,
            amount: Number(remainingDebt.toFixed(2)),
          })

          creditors[0].balance -= remainingDebt
          remainingDebt = 0
        }
      }
    })

    return settlement
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: trip.currency,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getPersonName = (personId: string) => {
    return people.find((person) => person.id === personId)?.name || "Unknown"
  }

  const getPersonColor = (personId: string) => {
    return people.find((person) => person.id === personId)?.color || "bg-gray-500"
  }

  const balances = calculateBalances()
  const maxAbsBalance = Math.max(...Object.values(balances).map(Math.abs), 0.01)
  const settlementPlan = calculateSettlement()

  const exportSummary = () => {
    // Create CSV content
    const headers = ["Name", "Balance"]
    const rows = people.map((person) => [person.name, balances[person.id].toFixed(2)])

    // Add settlement plan
    rows.push([])
    rows.push(["Settlement Plan"])
    rows.push(["From", "To", "Amount"])
    settlementPlan.forEach((settlement) => {
      rows.push([getPersonName(settlement.from), getPersonName(settlement.to), settlement.amount.toFixed(2)])
    })

    // Combine header and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${trip.name}_summary.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Summary exported",
      description: "The summary has been exported as CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Summary</h2>
        <Button variant="outline" onClick={exportSummary}>
          <Download className="h-4 w-4 mr-2" />
          Export Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Balances</CardTitle>
            <CardDescription>Who owes what after all expenses and settlements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {people.map((person) => {
                const balance = balances[person.id] || 0
                const isPositive = balance >= 0
                const progressPercentage = maxAbsBalance ? (Math.abs(balance) / maxAbsBalance) * 100 : 0

                return (
                  <div key={person.id} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                        <span className="font-medium">{person.name}</span>
                      </div>
                      <span className={isPositive ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className="h-2 bg-secondary"
                      indicatorClassName={isPositive ? "bg-green-500" : "bg-red-500"}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settlement Plan</CardTitle>
            <CardDescription>Suggested payments to settle all debts</CardDescription>
          </CardHeader>
          <CardContent>
            {settlementPlan.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Everyone is settled up!</p>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {settlementPlan.map((settlement, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 dark:bg-orange-950 border border-orange-100 dark:border-orange-900 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center gap-1">
                          <span className={cn("w-2 h-2 rounded-full", getPersonColor(settlement.from))}></span>
                          <span className="font-medium">{getPersonName(settlement.from)}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 mx-2 text-orange-500" />
                        <div className="flex items-center gap-1">
                          <span className={cn("w-2 h-2 rounded-full", getPersonColor(settlement.to))}></span>
                          <span className="font-medium">{getPersonName(settlement.to)}</span>
                        </div>
                      </div>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(settlement.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Statistics</CardTitle>
          <CardDescription>Overview of the trip expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(trip.totalExpenses)}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Per Person (Avg)</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(people.length > 0 ? trip.totalExpenses / people.length : 0)}
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Number of Expenses</p>
              <p className="text-2xl font-bold mt-1">{expenses.length}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Settlements Made</p>
              <p className="text-2xl font-bold mt-1">{settlements.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

