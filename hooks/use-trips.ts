"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { Trip } from "@/types"

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load trips from localStorage
  useEffect(() => {
    if (!user) {
      setTrips([])
      setIsLoading(false)
      return
    }

    const loadTrips = () => {
      const storedTrips = localStorage.getItem(`trips_${user.id}`)
      if (storedTrips) {
        try {
          const parsedTrips = JSON.parse(storedTrips)
          setTrips(parsedTrips)
        } catch (error) {
          console.error("Failed to parse trips from localStorage", error)
          setTrips([])
        }
      } else {
        setTrips([])
      }
      setIsLoading(false)
    }

    loadTrips()
  }, [user])

  // Save trips to localStorage
  useEffect(() => {
    if (user && !isLoading) {
      localStorage.setItem(`trips_${user.id}`, JSON.stringify(trips))
    }
  }, [trips, user, isLoading])

  // Add a new trip
  const addTrip = useCallback(
    async (tripData: Partial<Trip>): Promise<Trip> => {
      if (!user) throw new Error("User not authenticated")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newTrip: Trip = {
        id: `trip_${Date.now()}`,
        userId: user.id,
        name: tripData.name || "Untitled Trip",
        description: tripData.description,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        currency: tripData.currency || "USD",
        budget: tripData.budget,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 0,
        totalExpenses: 0,
      }

      // Update state and immediately save to localStorage
      const updatedTrips = [...trips, newTrip]
      setTrips(updatedTrips)
      localStorage.setItem(`trips_${user.id}`, JSON.stringify(updatedTrips))

      return newTrip
    },
    [trips, user],
  )

  // Get a trip by ID
  const getTrip = useCallback(
    (id: string): Trip | undefined => {
      // First check in the current state
      const tripInState = trips.find((trip) => trip.id === id)
      if (tripInState) return tripInState

      // If not found in state, try to get from localStorage directly
      if (user) {
        const storedTrips = localStorage.getItem(`trips_${user.id}`)
        if (storedTrips) {
          try {
            const parsedTrips = JSON.parse(storedTrips)
            const tripInStorage = parsedTrips.find((trip: Trip) => trip.id === id)
            if (tripInStorage) {
              // If found in localStorage but not in state, update state
              if (!tripInState) {
                setTrips(parsedTrips)
              }
              return tripInStorage
            }
          } catch (error) {
            console.error("Failed to parse trips from localStorage", error)
          }
        }
      }

      return undefined
    },
    [trips, user],
  )

  // Update a trip
  const updateTrip = useCallback(
    async (id: string, tripData: Partial<Trip>): Promise<Trip> => {
      if (!user) throw new Error("User not authenticated")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedTrips = trips.map((trip) => {
        if (trip.id === id) {
          return {
            ...trip,
            ...tripData,
            updatedAt: new Date(),
          }
        }
        return trip
      })

      setTrips(updatedTrips)
      localStorage.setItem(`trips_${user.id}`, JSON.stringify(updatedTrips))

      const updatedTrip = updatedTrips.find((trip) => trip.id === id)
      if (!updatedTrip) throw new Error("Trip not found")

      return updatedTrip
    },
    [trips, user],
  )

  // Delete a trip
  const deleteTrip = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error("User not authenticated")

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedTrips = trips.filter((trip) => trip.id !== id)
      setTrips(updatedTrips)
      localStorage.setItem(`trips_${user.id}`, JSON.stringify(updatedTrips))
    },
    [trips, user],
  )

  return {
    trips,
    isLoading,
    addTrip,
    getTrip,
    updateTrip,
    deleteTrip,
  }
}

