"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import type { Trip, Expense } from "@/types"
import { format } from "date-fns"
import { Plus, Calendar, Trash2, Upload, Search, Filter } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useExpenses } from "@/hooks/use-expenses"
import { usePeople } from "@/hooks/use-people"
import { CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { notificationService } from "@/lib/notification-service"

interface ExpensesTabProps {
  trip: Trip
}

export function ExpensesTab({ trip }: ExpensesTabProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isExpenseDetailsOpen, setIsExpenseDetailsOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    tripId: trip.id,
    payerId: "",
    item: "",
    amount: 0,
    participants: [],
    date: new Date(),
    category: "other",
    splitType: "equal",
    customSplits: {},
  })
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [customSplitValues, setCustomSplitValues] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null)
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { expenses, addExpense, deleteExpense } = useExpenses(trip.id)
  const { people } = usePeople(trip.id)
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Apply search and filters to expenses
  const filteredExpenses = expenses
    .filter((expense) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesItem = expense.item.toLowerCase().includes(query)
        const matchesPayer = people
          .find((p) => p.id === expense.payerId)
          ?.name.toLowerCase()
          .includes(query)
        const matchesCategory = CATEGORIES.find((c) => c.id === expense.category)
          ?.name.toLowerCase()
          .includes(query)
        const matchesNotes = expense.notes?.toLowerCase().includes(query)

        return matchesItem || matchesPayer || matchesCategory || matchesNotes
      }
      return true
    })
    .filter((expense) => {
      // Category filter
      if (filterCategory) {
        return expense.category === filterCategory
      }
      return true
    })
    .filter((expense) => {
      // Date range filter
      if (filterDateFrom && filterDateTo) {
        const expenseDate = new Date(expense.date)
        return expenseDate >= filterDateFrom && expenseDate <= filterDateTo
      }
      if (filterDateFrom) {
        return new Date(expense.date) >= filterDateFrom
      }
      if (filterDateTo) {
        return new Date(expense.date) <= filterDateTo
      }
      return true
    })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleAddExpense = async () => {
    if (
      !newExpense.payerId ||
      !newExpense.item ||
      !newExpense.amount ||
      !newExpense.participants ||
      newExpense.participants.length === 0
    ) {
      toast({
        title: "Invalid expense",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    let finalCustomSplits = {}

    // Process custom splits based on split type
    if (newExpense.splitType === "percentage" || newExpense.splitType === "custom") {
      finalCustomSplits = customSplitValues
    }

    const expense: Expense = {
      id: `expense_${Date.now()}`,
      tripId: trip.id,
      payerId: newExpense.payerId!,
      item: newExpense.item!,
      amount: Number(newExpense.amount),
      participants: newExpense.participants!,
      date: newExpense.date || new Date(),
      category: newExpense.category || "other",
      notes: newExpense.notes,
      receipt: receiptImage || undefined,
      splitType: newExpense.splitType || "equal",
      customSplits: Object.keys(finalCustomSplits).length > 0 ? finalCustomSplits : undefined,
      paymentMethod: newExpense.paymentMethod,
      createdAt: new Date(),
    }

    // Add the expense
    addExpense(expense)

    // Get payer and participants
    const payer = people.find((p) => p.id === expense.payerId)!
    const participantPeople = people.filter((p) => expense.participants.includes(p.id))

    // Send email notification
    try {
      await notificationService.sendExpenseNotification(expense, trip, payer, participantPeople)

      toast({
        title: "Expense added",
        description: `${expense.item} (${formatCurrency(expense.amount)}) has been added and notification sent.`,
      })
    } catch (error) {
      console.error("Failed to send notification", error)

      toast({
        title: "Expense added",
        description: `${expense.item} (${formatCurrency(expense.amount)}) has been added, but notification failed.`,
      })
    }

    setNewExpense({
      tripId: trip.id,
      payerId: "",
      item: "",
      amount: 0,
      participants: [],
      date: new Date(),
      category: "other",
      splitType: "equal",
    })
    setReceiptImage(null)
    setCustomSplitValues({})
    setIsAddExpenseOpen(false)
  }

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId)
    setIsExpenseDetailsOpen(false)

    toast({
      title: "Expense deleted",
      description: "The expense has been deleted.",
    })
  }

  const handleViewExpenseDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsExpenseDetailsOpen(true)
  }

  const toggleParticipant = (personId: string) => {
    setNewExpense((prev) => {
      const participants = prev.participants || []

      if (participants.includes(personId)) {
        // Remove participant
        const updatedParticipants = participants.filter((id) => id !== personId)

        // Also remove from custom splits if applicable
        if (prev.splitType === "percentage" || prev.splitType === "custom") {
          const updatedSplits = { ...customSplitValues }
          delete updatedSplits[personId]

          // Redistribute percentages for percentage splits
          if (prev.splitType === "percentage" && updatedParticipants.length > 0) {
            const equalShare = 100 / updatedParticipants.length
            updatedParticipants.forEach((id) => {
              updatedSplits[id] = equalShare
            })
          }

          setCustomSplitValues(updatedSplits)
        }

        return { ...prev, participants: updatedParticipants }
      } else {
        // Add participant
        const updatedParticipants = [...participants, personId]

        // Add to custom splits if applicable
        if (prev.splitType === "percentage" || prev.splitType === "custom") {
          const updatedSplits = { ...customSplitValues }

          if (prev.splitType === "percentage") {
            // Redistribute percentages equally
            const equalShare = 100 / updatedParticipants.length
            updatedParticipants.forEach((id) => {
              updatedSplits[id] = equalShare
            })
          } else {
            // For custom splits, initialize with 0
            updatedSplits[personId] = 0
          }

          setCustomSplitValues(updatedSplits)
        }

        return { ...prev, participants: updatedParticipants }
      }
    })
  }

  const handleSplitValueChange = (personId: string, value: number) => {
    setCustomSplitValues((prev) => ({
      ...prev,
      [personId]: value,
    }))
  }

  const resetFilters = () => {
    setSearchQuery("")
    setFilterCategory(null)
    setFilterDateFrom(null)
    setFilterDateTo(null)
    setIsFilterOpen(false)

    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    })
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

  const getCategoryDetails = (categoryId: string) => {
    return CATEGORIES.find((cat) => cat.id === categoryId) || { id: "other", name: "Other", icon: "📦" }
  }

  const getPaymentMethodDetails = (methodId?: string) => {
    if (!methodId) return { id: "other", name: "Other", icon: "💰" }
    return PAYMENT_METHODS.find((m) => m.id === methodId) || { id: "other", name: "Other", icon: "💰" }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>Enter the details of the expense to add it to your trip.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="payer">Who paid?</Label>
                  <Select
                    value={newExpense.payerId}
                    onValueChange={(value) => setNewExpense({ ...newExpense, payerId: value })}
                  >
                    <SelectTrigger id="payer">
                      <SelectValue placeholder="Select Payer" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                            {person.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePicker date={newExpense.date} setDate={(date) => setNewExpense({ ...newExpense, date })} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="item">What was it for?</Label>
                <Input
                  id="item"
                  placeholder="Enter Item"
                  value={newExpense.item}
                  onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">How much?</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{trip.currency}</span>
                    <Input
                      id="amount"
                      placeholder="Enter Amount"
                      type="number"
                      value={newExpense.amount || ""}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: Number.parseFloat(e.target.value) || 0 })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={newExpense.paymentMethod}
                  onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <span className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          {method.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Split Type</Label>
                <RadioGroup
                  value={newExpense.splitType}
                  onValueChange={(value: "equal" | "percentage" | "custom") =>
                    setNewExpense({ ...newExpense, splitType: value })
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equal" id="split-equal" />
                    <Label htmlFor="split-equal">Equal Split</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="split-percentage" />
                    <Label htmlFor="split-percentage">Percentage Split</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="split-custom" />
                    <Label htmlFor="split-custom">Custom Amount Split</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label>Split with</Label>
                <div className="grid grid-cols-3 gap-2">
                  {people.map((person) => (
                    <div key={person.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`person-${person.id}`}
                        checked={(newExpense.participants || []).includes(person.id)}
                        onCheckedChange={() => toggleParticipant(person.id)}
                      />
                      <Label htmlFor={`person-${person.id}`} className="flex items-center gap-1">
                        <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                        {person.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {(newExpense.splitType === "percentage" || newExpense.splitType === "custom") &&
                newExpense.participants &&
                newExpense.participants.length > 0 && (
                  <div className="grid gap-2">
                    <Label>
                      {newExpense.splitType === "percentage" ? "Percentage Distribution" : "Custom Amounts"}
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {newExpense.participants.map((participantId) => (
                        <div key={participantId} className="space-y-1">
                          <div className="flex justify-between">
                            <Label className="flex items-center gap-1">
                              <span className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}></span>
                              {getPersonName(participantId)}
                            </Label>
                            <span className="text-sm">
                              {newExpense.splitType === "percentage"
                                ? `${customSplitValues[participantId]?.toFixed(0) || 0}%`
                                : formatCurrency(customSplitValues[participantId] || 0)}
                            </span>
                          </div>
                          <Slider
                            value={[customSplitValues[participantId] || 0]}
                            max={newExpense.splitType === "percentage" ? 100 : newExpense.amount || 0}
                            step={newExpense.splitType === "percentage" ? 1 : 1}
                            onValueChange={(value) => handleSplitValueChange(participantId, value[0])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes"
                    value={newExpense.notes || ""}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Receipt (Optional)</Label>
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={triggerFileUpload} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Receipt
                    </Button>

                    {receiptImage && (
                      <div className="relative w-full">
                        <img
                          src={receiptImage || "/placeholder.svg"}
                          alt="Receipt"
                          className="w-full h-auto max-h-40 object-contain rounded-md mt-2"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full"
                          onClick={() => setReceiptImage(null)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>Add Expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filter</span>
              {(filterCategory || filterDateFrom || filterDateTo) && (
                <Badge variant="secondary" className="ml-1 h-5 rounded-full">
                  {(filterCategory ? 1 : 0) + (filterDateFrom || filterDateTo ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filters</h4>
                <p className="text-sm text-muted-foreground">Narrow down expenses by category or date</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={filterCategory || ""} onValueChange={(value) => setFilterCategory(value || null)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dateFrom" className="sr-only">
                      From
                    </Label>
                    <DatePicker date={filterDateFrom} setDate={setFilterDateFrom} placeholder="From" />
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="sr-only">
                      To
                    </Label>
                    <DatePicker date={filterDateTo} setDate={setFilterDateTo} placeholder="To" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No expenses added to this trip yet</p>
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No expenses match your search or filters</p>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Expense List</CardTitle>
            <CardDescription>All expenses for this trip</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="border rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
                    onClick={() => handleViewExpenseDetails(expense)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{expense.item}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={cn("w-2 h-2 rounded-full", getPersonColor(expense.payerId))}></span>
                          <p className="text-sm text-muted-foreground">Paid by {getPersonName(expense.payerId)}</p>
                        </div>
                        <div className="flex items-center flex-wrap mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(expense.date), "MMM d, yyyy")}
                          <span className="mx-1">•</span>
                          <span className="flex items-center">
                            {getCategoryDetails(expense.category).icon}
                            <span className="ml-1">{getCategoryDetails(expense.category).name}</span>
                          </span>
                          {expense.paymentMethod && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="flex items-center">
                                {getPaymentMethodDetails(expense.paymentMethod).icon}
                                <span className="ml-1">{getPaymentMethodDetails(expense.paymentMethod).name}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{formatCurrency(expense.amount)}</span>
                        <div className="flex items-center justify-end mt-1">
                          <p className="text-xs text-muted-foreground mr-1">{expense.participants.length} people</p>
                          {expense.splitType !== "equal" && (
                            <Badge variant="outline" className="text-xs h-4">
                              {expense.splitType === "percentage" ? "%" : "$"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Dialog open={isExpenseDetailsOpen} onOpenChange={setIsExpenseDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedExpense && (
            <>
              <DialogHeader>
                <DialogTitle>Expense Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{selectedExpense.item}</h3>
                  <Badge variant="outline" className="flex items-center">
                    <span className="mr-1">{getCategoryDetails(selectedExpense.category).icon}</span>
                    {getCategoryDetails(selectedExpense.category).name}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold text-lg">{formatCurrency(selectedExpense.amount)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Paid by</span>
                      <div className="flex items-center gap-1">
                        <span className={cn("w-2 h-2 rounded-full", getPersonColor(selectedExpense.payerId))}></span>
                        <span>{getPersonName(selectedExpense.payerId)}</span>
                      </div>
                    </div>

                    {selectedExpense.paymentMethod && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Payment Method</span>
                        <div className="flex items-center gap-1">
                          <span>{getPaymentMethodDetails(selectedExpense.paymentMethod).icon}</span>
                          <span>{getPaymentMethodDetails(selectedExpense.paymentMethod).name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Date</span>
                      <span>{format(new Date(selectedExpense.date), "MMMM d, yyyy")}</span>
                    </div>

                    <div className="py-2 border-b">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Split between</span>
                        <Badge variant="outline">
                          {selectedExpense.splitType === "equal"
                            ? "Equal Split"
                            : selectedExpense.splitType === "percentage"
                              ? "Percentage Split"
                              : "Custom Split"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedExpense.participants.map((participantId) => (
                          <Badge key={participantId} variant="secondary" className="flex items-center gap-1">
                            <span className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}></span>
                            {getPersonName(participantId)}
                            {selectedExpense.splitType !== "equal" && selectedExpense.customSplits && (
                              <span className="ml-1 opacity-70">
                                {selectedExpense.splitType === "percentage"
                                  ? `(${selectedExpense.customSplits[participantId]}%)`
                                  : `(${formatCurrency(selectedExpense.customSplits[participantId])})`}
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="py-2 border-b">
                      <p className="text-muted-foreground mb-2">Each person pays</p>
                      {selectedExpense.splitType === "equal" ? (
                        <p className="font-medium">
                          {formatCurrency(selectedExpense.amount / selectedExpense.participants.length)}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {selectedExpense.participants.map((participantId) => (
                            <div key={participantId} className="flex justify-between">
                              <div className="flex items-center gap-1">
                                <span className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}></span>
                                <span>{getPersonName(participantId)}</span>
                              </div>
                              <span className="font-medium">
                                {selectedExpense.splitType === "percentage" && selectedExpense.customSplits
                                  ? formatCurrency(
                                      (selectedExpense.amount * selectedExpense.customSplits[participantId]) / 100,
                                    )
                                  : selectedExpense.customSplits
                                    ? formatCurrency(selectedExpense.customSplits[participantId])
                                    : formatCurrency(selectedExpense.amount / selectedExpense.participants.length)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedExpense.notes && (
                      <div className="py-2 border-b">
                        <p className="text-muted-foreground mb-1">Notes</p>
                        <p>{selectedExpense.notes}</p>
                      </div>
                    )}

                    {selectedExpense.receipt && (
                      <div className="py-2">
                        <p className="text-muted-foreground mb-2">Receipt</p>
                        <div className="flex justify-center">
                          <img
                            src={selectedExpense.receipt || "/placeholder.svg"}
                            alt="Receipt"
                            className="max-w-full h-auto max-h-60 object-contain rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={() => handleDeleteExpense(selectedExpense.id)}>
                  Delete Expense
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

