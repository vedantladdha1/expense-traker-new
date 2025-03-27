"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Trip, Settlement } from "@/types"
import { format } from "date-fns"
import { ArrowRight, Plus, Calendar, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useSettlements } from "@/hooks/use-settlements"
import { usePeople } from "@/hooks/use-people"

interface SettlementsTabProps {
  trip: Trip
}

export function SettlementsTab({ trip }: SettlementsTabProps) {
  const [isAddSettlementOpen, setIsAddSettlementOpen] = useState(false)
  const [newSettlement, setNewSettlement] = useState<Partial<Settlement>>({
    fromPersonId: "",
    toPersonId: "",
    amount: 0,
    date: new Date(),
    method: "cash",
    notes: "",
  })

  const { settlements, addSettlement, deleteSettlement } = useSettlements(trip.id)
  const { people } = usePeople(trip.id)
  const { toast } = useToast()

  const handleAddSettlement = () => {
    if (
      !newSettlement.fromPersonId ||
      !newSettlement.toPersonId ||
      !newSettlement.amount ||
      newSettlement.amount <= 0
    ) {
      toast({
        title: "Invalid settlement",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      })
      return
    }

    if (newSettlement.fromPersonId === newSettlement.toPersonId) {
      toast({
        title: "Invalid settlement",
        description: "A person cannot settle with themselves.",
        variant: "destructive",
      })
      return
    }

    addSettlement({
      ...(newSettlement as Settlement),
      id: `settlement_${Date.now()}`,
      tripId: trip.id,
      createdAt: new Date(),
    })

    setNewSettlement({
      fromPersonId: "",
      toPersonId: "",
      amount: 0,
      date: new Date(),
      method: "cash",
      notes: "",
    })

    setIsAddSettlementOpen(false)

    toast({
      title: "Settlement recorded",
      description: "The settlement has been recorded successfully.",
    })
  }

  const handleDeleteSettlement = (settlementId: string) => {
    deleteSettlement(settlementId)

    toast({
      title: "Settlement deleted",
      description: "The settlement has been deleted.",
    })
  }

  const getPersonName = (personId: string): string => {
    return people.find((p) => p.id === personId)?.name || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settlements</h2>
        <Dialog open={isAddSettlementOpen} onOpenChange={setIsAddSettlementOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Settlement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record a Settlement</DialogTitle>
              <DialogDescription>Record a payment made between people to settle debts.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fromPerson">From (Who Paid)</Label>
                  <Select
                    value={newSettlement.fromPersonId}
                    onValueChange={(value) => setNewSettlement({ ...newSettlement, fromPersonId: value })}
                  >
                    <SelectTrigger id="fromPerson">
                      <SelectValue placeholder="Select Person" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="toPerson">To (Who Received)</Label>
                  <Select
                    value={newSettlement.toPersonId}
                    onValueChange={(value) => setNewSettlement({ ...newSettlement, toPersonId: value })}
                  >
                    <SelectTrigger id="toPerson">
                      <SelectValue placeholder="Select Person" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{trip.currency}</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={newSettlement.amount || ""}
                      onChange={(e) =>
                        setNewSettlement({ ...newSettlement, amount: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePicker
                    date={newSettlement.date}
                    setDate={(date) => setNewSettlement({ ...newSettlement, date })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={newSettlement.method}
                  onValueChange={(value) => setNewSettlement({ ...newSettlement, method: value })}
                >
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes"
                  value={newSettlement.notes || ""}
                  onChange={(e) => setNewSettlement({ ...newSettlement, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSettlementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSettlement}>Record Settlement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {settlements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No settlements recorded yet</p>
            <Button onClick={() => setIsAddSettlementOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Settlement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Settlement History</CardTitle>
            <CardDescription>Record of all payments made between people to settle debts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {settlements.map((settlement) => (
                  <div
                    key={settlement.id}
                    className="border rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{getPersonName(settlement.fromPersonId)}</span>
                          <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                          <span className="font-medium">{getPersonName(settlement.toPersonId)}</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(settlement.date), "MMM d, yyyy")}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {settlement.method}
                          </Badge>
                        </div>
                        {settlement.notes && <p className="mt-2 text-sm text-muted-foreground">{settlement.notes}</p>}
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold text-lg">
                          {trip.currency} {settlement.amount.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteSettlement(settlement.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

