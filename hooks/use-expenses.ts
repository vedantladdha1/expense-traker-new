"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { Expense } from "@/types"
import { useTrips } from "@/hooks/use-trips"

export function useExpenses(tripId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { updateTrip } = useTrips()

  // Load expenses from localStorage
  useEffect(() => {
    if (!user || !tripId) {
      setExpenses([])
      setIsLoading(false)
      return
    }

    const loadExpenses = () => {
      const storedExpenses = localStorage.getItem(`expenses_${tripId}`)
      if (storedExpenses) {
        try {
          const parsedExpenses = JSON.parse(storedExpenses)
          // Convert date strings back to Date objects
          const expensesWithDates = parsedExpenses.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
            createdAt: new Date(expense.createdAt),
          }))
          setExpenses(expensesWithDates)
        } catch (error) {
          console.error("Failed to parse expenses from localStorage", error)
          setExpenses([])
        }
      } else {
        setExpenses([])
      }
      setIsLoading(false)
    }

    loadExpenses()
  }, [user, tripId])

  // Save expenses to localStorage and update trip total expenses
  useEffect(() => {
    if (user && tripId && !isLoading) {
      localStorage.setItem(`expenses_${tripId}`, JSON.stringify(expenses))

      // Update trip total expenses
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      updateTrip(tripId, { totalExpenses }).catch((error) =>
        console.error("Failed to update trip total expenses", error),
      )
    }
  }, [expenses, user, tripId, isLoading, updateTrip])

  // Add a new expense
  const addExpense = useCallback(
    (expense: Expense) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setExpenses((prev) => [...prev, expense])
    },
    [user, tripId],
  )

  // Update an expense
  const updateExpense = useCallback(
    (expenseId: string, data: Partial<Expense>) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setExpenses((prev) => prev.map((expense) => (expense.id === expenseId ? { ...expense, ...data } : expense)))
    },
    [user, tripId],
  )

  // Delete an expense
  const deleteExpense = useCallback(
    (expenseId: string) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId))
    },
    [user, tripId],
  )

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
  }
}

