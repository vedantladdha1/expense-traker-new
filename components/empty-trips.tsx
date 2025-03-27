"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { CreateTripDialog } from "@/components/create-trip-dialog"

export function EmptyTrips() {
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false)

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg font-semibold">No trips created</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven&apos;t created any trips yet. Start by creating a new trip.
        </p>
        <Button onClick={() => setIsCreateTripOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      <CreateTripDialog open={isCreateTripOpen} onOpenChange={setIsCreateTripOpen} />
    </div>
  )
}

