"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { Settlement } from "@/types"

export function useSettlements(tripId: string) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load settlements from localStorage
  useEffect(() => {
    if (!user || !tripId) {
      setSettlements([])
      setIsLoading(false)
      return
    }

    const loadSettlements = () => {
      const storedSettlements = localStorage.getItem(`settlements_${tripId}`)
      if (storedSettlements) {
        try {
          const parsedSettlements = JSON.parse(storedSettlements)
          setSettlements(parsedSettlements)
        } catch (error) {
          console.error("Failed to parse settlements from localStorage", error)
          setSettlements([])
        }
      } else {
        setSettlements([])
      }
      setIsLoading(false)
    }

    loadSettlements()
  }, [user, tripId])

  // Save settlements to localStorage
  useEffect(() => {
    if (user && tripId && !isLoading) {
      localStorage.setItem(`settlements_${tripId}`, JSON.stringify(settlements))
    }
  }, [settlements, user, tripId, isLoading])

  // Add a new settlement
  const addSettlement = useCallback(
    (settlement: Settlement) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setSettlements((prev) => [...prev, settlement])
    },
    [user, tripId],
  )

  // Delete a settlement
  const deleteSettlement = useCallback(
    (settlementId: string) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setSettlements((prev) => prev.filter((settlement) => settlement.id !== settlementId))
    },
    [user, tripId],
  )

  return {
    settlements,
    isLoading,
    addSettlement,
    deleteSettlement,
  }
}

