"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useTrips } from "@/hooks/use-trips"
import { CURRENCIES } from "@/lib/constants"

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTripDialog({ open, onOpenChange }: CreateTripDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [currency, setCurrency] = useState("USD")
  const [budget, setBudget] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { addTrip } = useTrips()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Trip name required",
        description: "Please enter a name for your trip.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newTrip = await addTrip({
        name,
        description,
        startDate,
        endDate,
        currency,
        budget: budget ? Number.parseFloat(budget) : undefined,
      })

      toast({
        title: "Trip created",
        description: "Your new trip has been created successfully.",
      })

      // Close the dialog first
      onOpenChange(false)

      // Wait to ensure the trip is saved before navigating
      setTimeout(() => {
        // Use window.location for a full page navigation to ensure fresh data loading
        window.location.href = `/dashboard/trips/${newTrip.id}`
      }, 300)
    } catch (error) {
      console.error("Failed to create trip:", error)
      toast({
        title: "Failed to create trip",
        description: "There was an error creating your trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>
              Add the details for your new trip. You can add people and expenses later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Vacation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the trip"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="budget">Budget (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter budget amount"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

