"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { Person } from "@/types"
import { useTrips } from "@/hooks/use-trips"

export function usePeople(tripId: string) {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { updateTrip } = useTrips()

  // Load people from localStorage
  useEffect(() => {
    if (!user || !tripId) {
      setPeople([])
      setIsLoading(false)
      return
    }

    const loadPeople = () => {
      const storedPeople = localStorage.getItem(`people_${tripId}`)
      if (storedPeople) {
        try {
          const parsedPeople = JSON.parse(storedPeople)
          setPeople(parsedPeople)
        } catch (error) {
          console.error("Failed to parse people from localStorage", error)
          setPeople([])
        }
      } else {
        setPeople([])
      }
      setIsLoading(false)
    }

    loadPeople()
  }, [user, tripId])

  // Save people to localStorage and update trip member count
  useEffect(() => {
    if (user && tripId && !isLoading) {
      localStorage.setItem(`people_${tripId}`, JSON.stringify(people))

      // Update trip member count
      updateTrip(tripId, { memberCount: people.length }).catch((error) =>
        console.error("Failed to update trip member count", error),
      )
    }
  }, [people, user, tripId, isLoading, updateTrip])

  // Add a new person
  const addPerson = useCallback(
    (person: Omit<Person, "id" | "tripId">) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      const newPerson: Person = {
        id: `person_${Date.now()}`,
        tripId,
        ...person,
      }

      setPeople((prev) => [...prev, newPerson])
      return newPerson
    },
    [user, tripId],
  )

  // Update a person
  const updatePerson = useCallback(
    (personId: string, data: Partial<Person>) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setPeople((prev) => prev.map((person) => (person.id === personId ? { ...person, ...data } : person)))
    },
    [user, tripId],
  )

  // Delete a person
  const deletePerson = useCallback(
    (personId: string) => {
      if (!user) throw new Error("User not authenticated")
      if (!tripId) throw new Error("Trip ID is required")

      setPeople((prev) => prev.filter((person) => person.id !== personId))
    },
    [user, tripId],
  )

  return {
    people,
    isLoading,
    addPerson,
    updatePerson,
    deletePerson,
  }
}

