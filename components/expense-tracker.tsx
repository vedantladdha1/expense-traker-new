"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Users,
  DollarSign,
  FolderOpen,
  ArrowRight,
  PlusCircle,
  Receipt,
  PieChart,
  Calendar,
  Clock,
  Trash2,
  Map,
  AlertTriangle,
  Award,
  Ban,
  Search,
  Download,
  Moon,
  Sun,
  Upload,
  Filter,
  Smartphone,
  CreditCard,
  Wallet,
  RefreshCw,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ExpenseChart } from "@/components/expense-chart"

// Types
interface Trip {
  id: string
  name: string
  description?: string
  startDate?: Date
  endDate?: Date
  budget?: number
  currency: string
}

interface Person {
  id: string
  name: string
  tripId: string
  email?: string
  color?: string
}

interface Expense {
  id: string
  tripId: string
  payerId: string
  item: string
  amount: number
  participants: string[]
  date: Date
  category: string
  notes?: string
  receipt?: string
  splitType: "equal" | "percentage" | "custom"
  customSplits?: Record<string, number>
  paymentMethod?: string
}

interface CategoryTotal {
  category: string
  amount: number
  percentage: number
}

interface AppSettings {
  darkMode: boolean
  currency: string
  language: string
  notificationsEnabled: boolean
  autoSave: boolean
}

// Sample categories with icons
const CATEGORIES = [
  { id: "food", name: "Food & Drinks", icon: "🍔" },
  { id: "transport", name: "Transportation", icon: "🚕" },
  { id: "accommodation", name: "Accommodation", icon: "🏨" },
  { id: "activities", name: "Activities", icon: "🎭" },
  { id: "shopping", name: "Shopping", icon: "🛍️" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
  { id: "health", name: "Health", icon: "💊" },
  { id: "gifts", name: "Gifts", icon: "🎁" },
  { id: "utilities", name: "Utilities", icon: "💡" },
  { id: "other", name: "Other", icon: "📦" },
]

// Payment methods
const PAYMENT_METHODS = [
  { id: "cash", name: "Cash", icon: <Wallet className="h-4 w-4" /> },
  { id: "credit", name: "Credit Card", icon: <CreditCard className="h-4 w-4" /> },
  { id: "upi", name: "UPI", icon: <Smartphone className="h-4 w-4" /> },
  { id: "bank", name: "Bank Transfer", icon: <RefreshCw className="h-4 w-4" /> },
  { id: "other", name: "Other", icon: <DollarSign className="h-4 w-4" /> },
]

// Currencies
const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
]

// Generate a random color
const getRandomColor = () => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export default function ExpenseTracker() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: "1",
      name: "Manali Trip",
      description: "Weekend getaway to the mountains",
      startDate: new Date(2025, 2, 15),
      endDate: new Date(2025, 2, 18),
      budget: 50000,
      currency: "INR",
    },
  ])
  const [activeTrip, setActiveTrip] = useState<string>("1")
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Raghav", tripId: "1", color: "bg-blue-500" },
    { id: "2", name: "Harsh", tripId: "1", color: "bg-green-500" },
    { id: "3", name: "Hemant", tripId: "1", color: "bg-purple-500" },
  ])
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      tripId: "1",
      payerId: "1",
      item: "Shoes",
      amount: 20000,
      participants: ["1", "2", "3"],
      date: new Date(),
      category: "shopping",
      splitType: "equal",
    },
  ])
  const [newPersonName, setNewPersonName] = useState("")
  const [newPersonEmail, setNewPersonEmail] = useState("")
  const [activeTab, setActiveTab] = useState("people")
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    tripId: activeTrip,
    payerId: "",
    item: "",
    amount: 0,
    participants: [],
    date: new Date(),
    category: "other",
    splitType: "equal",
    customSplits: {},
  })
  const [newTrip, setNewTrip] = useState<Partial<Trip>>({
    name: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    budget: 0,
    currency: "INR",
  })
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false)
  const [isAddTripOpen, setIsAddTripOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isExpenseDetailsOpen, setIsExpenseDetailsOpen] = useState(false)
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [isDeletePersonDialogOpen, setIsDeletePersonDialogOpen] = useState(false)
  const [isDeleteTripDialogOpen, setIsDeleteTripDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null)
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    currency: "INR",
    language: "en",
    notificationsEnabled: true,
    autoSave: true,
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [customSplitValues, setCustomSplitValues] = useState<Record<string, number>>({})

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTrips = localStorage.getItem("trips")
    const savedPeople = localStorage.getItem("people")
    const savedExpenses = localStorage.getItem("expenses")
    const savedActiveTrip = localStorage.getItem("activeTrip")
    const savedSettings = localStorage.getItem("settings")

    if (savedTrips) setTrips(JSON.parse(savedTrips))
    if (savedPeople) setPeople(JSON.parse(savedPeople))
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses)
      // Convert date strings back to Date objects
      const expensesWithDates = parsedExpenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date),
      }))
      setExpenses(expensesWithDates)
    }
    if (savedActiveTrip) setActiveTrip(savedActiveTrip)
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (settings.autoSave) {
      localStorage.setItem("trips", JSON.stringify(trips))
      localStorage.setItem("people", JSON.stringify(people))
      localStorage.setItem("expenses", JSON.stringify(expenses))
      localStorage.setItem("activeTrip", activeTrip)
      localStorage.setItem("settings", JSON.stringify(settings))
    }
  }, [trips, people, expenses, activeTrip, settings])

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  // Update new expense tripId when active trip changes
  useEffect(() => {
    setNewExpense((prev) => ({ ...prev, tripId: activeTrip }))
    // Reset filters when changing trips
    setSearchQuery("")
    setFilterCategory(null)
    setFilterDateFrom(null)
    setFilterDateTo(null)
  }, [activeTrip])

  // Initialize custom split values when participants change
  useEffect(() => {
    if (newExpense.splitType === "custom" && newExpense.participants && newExpense.participants.length > 0) {
      const equalShare = 100 / newExpense.participants.length
      const initialValues: Record<string, number> = {}

      newExpense.participants.forEach((participantId) => {
        initialValues[participantId] = equalShare
      })

      setCustomSplitValues(initialValues)
    }
  }, [newExpense.participants, newExpense.splitType])

  // Filter people and expenses by active trip
  const filteredPeople = people.filter((person) => person.tripId === activeTrip)

  // Apply search and filters to expenses
  const filteredExpenses = expenses
    .filter((expense) => expense.tripId === activeTrip)
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

  // Get current trip
  const currentTrip = trips.find((trip) => trip.id === activeTrip)
  const currentCurrency = currentTrip?.currency || "INR"
  const currencySymbol = CURRENCIES.find((c) => c.code === currentCurrency)?.symbol || "₹"

  // Calculate balances
  const calculateBalances = () => {
    const balances: Record<string, number> = {}

    // Initialize balances to 0
    filteredPeople.forEach((person) => {
      balances[person.id] = 0
    })

    // Calculate what each person paid
    filteredExpenses.forEach((expense) => {
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

  // Calculate category totals
  const calculateCategoryTotals = (): CategoryTotal[] => {
    const categoryTotals: Record<string, number> = {}
    let totalAmount = 0

    // Sum expenses by category
    filteredExpenses.forEach((expense) => {
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
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Calculate payment frequency
  const calculatePaymentFrequency = () => {
    const frequency: Record<string, number> = {}

    // Initialize frequency to 0
    filteredPeople.forEach((person) => {
      frequency[person.id] = 0
    })

    // Count how many times each person paid
    filteredExpenses.forEach((expense) => {
      frequency[expense.payerId] = (frequency[expense.payerId] || 0) + 1
    })

    return frequency
  }

  // Find people who haven't paid yet
  const findNonPayers = () => {
    const payers = new Set(filteredExpenses.map((expense) => expense.payerId))
    return filteredPeople.filter((person) => !payers.has(person.id))
  }

  // Calculate budget status
  const calculateBudgetStatus = () => {
    if (!currentTrip?.budget) return null

    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const remaining = currentTrip.budget - totalSpent
    const percentage = (totalSpent / currentTrip.budget) * 100

    return {
      budget: currentTrip.budget,
      spent: totalSpent,
      remaining: remaining,
      percentage: percentage,
      isOverBudget: remaining < 0,
    }
  }

  // Add a new person
  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        tripId: activeTrip,
        email: newPersonEmail.trim() || undefined,
        color: getRandomColor(),
      }

      setPeople([...people, newPerson])
      setNewPersonName("")
      setNewPersonEmail("")
      setIsAddPersonOpen(false)

      toast({
        title: "Person added",
        description: `${newPersonName} has been added to the trip.`,
      })
    }
  }

  // Delete a person
  const deletePerson = (person: Person) => {
    setPersonToDelete(person)
    setIsDeletePersonDialogOpen(true)
  }

  // Confirm person deletion
  const confirmDeletePerson = () => {
    if (personToDelete) {
      // Remove the person
      setPeople(people.filter((p) => p.id !== personToDelete.id))

      // Remove the person from expense participants
      setExpenses(
        expenses.map((expense) => {
          if (expense.participants.includes(personToDelete.id)) {
            return {
              ...expense,
              participants: expense.participants.filter((id) => id !== personToDelete.id),
            }
          }
          return expense
        }),
      )

      // If the person is a payer, reassign or delete those expenses
      const personExpenses = expenses.filter((e) => e.payerId === personToDelete.id)
      if (personExpenses.length > 0) {
        // For simplicity, we'll delete these expenses
        setExpenses(expenses.filter((e) => e.payerId !== personToDelete.id))
      }

      setIsDeletePersonDialogOpen(false)
      setPersonToDelete(null)

      toast({
        title: "Person deleted",
        description: `${personToDelete.name} has been removed from the trip.`,
      })
    }
  }

  // Add a new trip
  const addTrip = () => {
    if (newTrip.name?.trim()) {
      const tripId = Date.now().toString()
      setTrips([
        ...trips,
        {
          id: tripId,
          name: newTrip.name.trim(),
          description: newTrip.description,
          startDate: newTrip.startDate,
          endDate: newTrip.endDate,
          budget: newTrip.budget,
          currency: newTrip.currency || "INR",
        },
      ])
      setNewTrip({
        name: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        budget: 0,
        currency: "INR",
      })
      setActiveTrip(tripId)
      setIsAddTripOpen(false)

      toast({
        title: "Trip created",
        description: `${newTrip.name} has been created.`,
      })
    }
  }

  // Delete a trip
  const deleteTrip = (trip: Trip) => {
    setTripToDelete(trip)
    setIsDeleteTripDialogOpen(true)
  }

  // Confirm trip deletion
  const confirmDeleteTrip = () => {
    if (tripToDelete) {
      // Remove the trip
      setTrips(trips.filter((t) => t.id !== tripToDelete.id))

      // Remove all people and expenses associated with this trip
      setPeople(people.filter((p) => p.tripId !== tripToDelete.id))
      setExpenses(expenses.filter((e) => e.tripId !== tripToDelete.id))

      // If this was the active trip, switch to another trip
      if (activeTrip === tripToDelete.id) {
        const remainingTrips = trips.filter((t) => t.id !== tripToDelete.id)
        if (remainingTrips.length > 0) {
          setActiveTrip(remainingTrips[0].id)
        } else {
          // Create a new default trip if no trips remain
          const newTripId = Date.now().toString()
          setTrips([
            {
              id: newTripId,
              name: "New Trip",
              currency: "INR",
            },
          ])
          setActiveTrip(newTripId)
        }
      }

      setIsDeleteTripDialogOpen(false)
      setTripToDelete(null)

      toast({
        title: "Trip deleted",
        description: `${tripToDelete.name} has been deleted.`,
      })
    }
  }

  // Handle file upload
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

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Add a new expense
  const addExpense = () => {
    if (
      newExpense.payerId &&
      newExpense.item &&
      newExpense.amount &&
      newExpense.participants &&
      newExpense.participants.length > 0
    ) {
      let finalCustomSplits = {}

      // Process custom splits based on split type
      if (newExpense.splitType === "percentage" || newExpense.splitType === "custom") {
        finalCustomSplits = customSplitValues
      }

      const expense: Expense = {
        id: Date.now().toString(),
        tripId: activeTrip,
        payerId: newExpense.payerId,
        item: newExpense.item,
        amount: Number(newExpense.amount),
        participants: newExpense.participants,
        date: newExpense.date || new Date(),
        category: newExpense.category || "other",
        notes: newExpense.notes,
        receipt: receiptImage || undefined,
        splitType: newExpense.splitType || "equal",
        customSplits: Object.keys(finalCustomSplits).length > 0 ? finalCustomSplits : undefined,
        paymentMethod: newExpense.paymentMethod,
      }

      setExpenses([...expenses, expense])
      setNewExpense({
        tripId: activeTrip,
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

      toast({
        title: "Expense added",
        description: `${expense.item} (${formatCurrency(expense.amount)}) has been added.`,
      })
    }
  }

  // Delete an expense
  const deleteExpense = (id: string) => {
    const expenseToDelete = expenses.find((e) => e.id === id)
    setExpenses(expenses.filter((expense) => expense.id !== id))
    setIsExpenseDetailsOpen(false)

    if (expenseToDelete) {
      toast({
        title: "Expense deleted",
        description: `${expenseToDelete.item} has been deleted.`,
      })
    }
  }

  // Handle participant selection
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

  // Handle custom split value change
  const handleSplitValueChange = (personId: string, value: number) => {
    setCustomSplitValues((prev) => ({
      ...prev,
      [personId]: value,
    }))
  }

  // View expense details
  const viewExpenseDetails = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsExpenseDetailsOpen(true)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currentCurrency,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Get person name by ID
  const getPersonName = (id: string) => {
    return people.find((person) => person.id === id)?.name || "Unknown"
  }

  // Get person color by ID
  const getPersonColor = (id: string) => {
    return people.find((person) => person.id === id)?.color || "bg-gray-500"
  }

  // Get category details
  const getCategoryDetails = (categoryId: string) => {
    return CATEGORIES.find((cat) => cat.id === categoryId) || { id: "other", name: "Other", icon: "📦" }
  }

  // Get payment method details
  const getPaymentMethodDetails = (methodId?: string) => {
    if (!methodId) return PAYMENT_METHODS.find((m) => m.id === "other")
    return PAYMENT_METHODS.find((m) => m.id === methodId) || PAYMENT_METHODS.find((m) => m.id === "other")
  }

  // Calculate total trip expenses
  const totalTripExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Balances for display
  const balances = calculateBalances()
  const maxAbsBalance = Math.max(...Object.values(balances).map(Math.abs), 0.01)

  // Payment frequency
  const paymentFrequency = calculatePaymentFrequency()
  const maxFrequency = Math.max(...Object.values(paymentFrequency), 1)

  // Non-payers
  const nonPayers = findNonPayers()

  // Budget status
  const budgetStatus = calculateBudgetStatus()

  // Export data as CSV
  const exportCSV = () => {
    // Create CSV header
    const headers = ["Date", "Item", "Category", "Amount", "Paid By", "Split With", "Notes"]

    // Create CSV rows
    const rows = filteredExpenses.map((expense) => [
      format(new Date(expense.date), "yyyy-MM-dd"),
      expense.item,
      getCategoryDetails(expense.category).name,
      expense.amount.toString(),
      getPersonName(expense.payerId),
      expense.participants.map((id) => getPersonName(id)).join(", "),
      expense.notes || "",
    ])

    // Combine header and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${currentTrip?.name || "trip"}_expenses.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Expenses have been exported as CSV.",
    })
  }

  // Reset filters
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setSettings((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }))
  }

  // Save settings
  const saveSettings = () => {
    setIsSettingsOpen(false)

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    })
  }

  // Manually save data
  const saveData = () => {
    localStorage.setItem("trips", JSON.stringify(trips))
    localStorage.setItem("people", JSON.stringify(people))
    localStorage.setItem("expenses", JSON.stringify(expenses))
    localStorage.setItem("activeTrip", activeTrip)
    localStorage.setItem("settings", JSON.stringify(settings))

    toast({
      title: "Data saved",
      description: "All your data has been saved locally.",
    })
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground transition-colors duration-300",
        settings.darkMode ? "dark" : "",
      )}
    >
      <div className="container mx-auto py-4 md:py-6 px-3 md:px-4 max-w-3xl">
        <div className="flex flex-col space-y-4">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">Trip Expense Tracker</h1>
              <p className="text-muted-foreground mt-1">Split expenses easily with friends</p>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-2">
              <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full">
                {settings.darkMode ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>

              <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
                <Settings className="h-[1.2rem] w-[1.2rem]" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Download className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={saveData}>Save Data Locally</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Trip Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              {isMobile ? (
                <Select value={activeTrip} onValueChange={setActiveTrip}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Trip" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trips.map((trip) => (
                    <Button
                      key={trip.id}
                      variant={trip.id === activeTrip ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTrip(trip.id)}
                      className="rounded-full"
                    >
                      {trip.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Dialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    New Trip
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Trip</DialogTitle>
                    <DialogDescription>Add details for your new trip</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tripName">Trip Name</Label>
                      <Input
                        id="tripName"
                        placeholder="e.g., Manali Trip"
                        value={newTrip.name}
                        onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tripDescription">Description (Optional)</Label>
                      <Textarea
                        id="tripDescription"
                        placeholder="Brief description of the trip"
                        value={newTrip.description}
                        onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tripBudget">Budget (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={newTrip.currency}
                          onValueChange={(value) => setNewTrip({ ...newTrip, currency: value })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="tripBudget"
                          type="number"
                          placeholder="Enter budget amount"
                          value={newTrip.budget || ""}
                          onChange={(e) => setNewTrip({ ...newTrip, budget: Number.parseFloat(e.target.value) || 0 })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <DatePicker
                          date={newTrip.startDate}
                          setDate={(date) => setNewTrip({ ...newTrip, startDate: date })}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <DatePicker
                          date={newTrip.endDate}
                          setDate={(date) => setNewTrip({ ...newTrip, endDate: date })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addTrip}>Create Trip</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {trips.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTrip(trips.find((t) => t.id === activeTrip)!)}
                  className="rounded-full"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Trip Details Card */}
          {currentTrip && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Map className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-lg">{currentTrip.name}</h3>
                      {currentTrip.description && (
                        <p className="text-sm text-muted-foreground">{currentTrip.description}</p>
                      )}
                      {currentTrip.startDate && currentTrip.endDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(currentTrip.startDate), "MMM d")} -
                          {format(new Date(currentTrip.endDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>

                  {budgetStatus && (
                    <div className="mt-3 md:mt-0 flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Budget:</span>
                        <span className="font-medium">{formatCurrency(budgetStatus.budget)}</span>
                      </div>
                      <div className="w-full md:w-48 mt-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{formatCurrency(budgetStatus.spent)}</span>
                          <span className={budgetStatus.isOverBudget ? "text-red-500" : "text-green-500"}>
                            {budgetStatus.isOverBudget ? "-" : ""}
                            {formatCurrency(Math.abs(budgetStatus.remaining))}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(budgetStatus.percentage, 100)}
                          className="h-2"
                          indicatorClassName={budgetStatus.isOverBudget ? "bg-red-500" : undefined}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="people" className="flex flex-col items-center py-2">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">People</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex flex-col items-center py-2">
                <Receipt className="h-5 w-5 mb-1" />
                <span className="text-xs">Expenses</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex flex-col items-center py-2">
                <FolderOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col items-center py-2">
                <PieChart className="h-5 w-5 mb-1" />
                <span className="text-xs">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Users className="h-6 w-6 text-primary mr-2" />
                    Add People
                  </CardTitle>
                  <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="ml-auto">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Person</DialogTitle>
                        <DialogDescription>Add a new person to split expenses with</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter name"
                            value={newPersonName}
                            onChange={(e) => setNewPersonName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email"
                            value={newPersonEmail}
                            onChange={(e) => setNewPersonEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addPerson}>Add Person</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        placeholder="Enter Name"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={addPerson} size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filteredPeople.map((person) => (
                        <div key={person.id} className="flex items-center">
                          <Badge variant="secondary" className={cn("px-3 py-1 text-sm flex items-center gap-1")}>
                            <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                            {person.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => deletePerson(person)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                    Current Balances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPeople.map((person) => {
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
                              {isPositive ? formatCurrency(balance) : formatCurrency(balance)}
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className={cn("h-2", isPositive ? "bg-gray-200" : "bg-gray-200")}
                            indicatorClassName={isPositive ? "bg-green-500" : "bg-red-500"}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                    Add Expense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    <Sheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                      <SheetTrigger asChild>
                        <Button className="w-full">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add New Expense
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Add New Expense</SheetTitle>
                          <SheetDescription>Enter the details of the expense</SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
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
                                {filteredPeople.map((person) => (
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
                            <Label htmlFor="item">What was it for?</Label>
                            <Input
                              id="item"
                              placeholder="Enter Item"
                              value={newExpense.item}
                              onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="amount">How much?</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{currencySymbol}</span>
                              <Input
                                id="amount"
                                placeholder="Enter Amount"
                                type="number"
                                value={newExpense.amount || ""}
                                onChange={(e) =>
                                  setNewExpense({ ...newExpense, amount: Number.parseFloat(e.target.value) || 0 })
                                }
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
                                <SelectValue placeholder="Select Category" value={newExpense.category || "other"} />
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
                                      {method.icon}
                                      {method.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <DatePicker
                              date={newExpense.date}
                              setDate={(date) => setNewExpense({ ...newExpense, date })}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Split Type</Label>
                            <RadioGroup
                              value={newExpense.splitType}
                              onValueChange={(value: "equal" | "percentage" | "custom") =>
                                setNewExpense({ ...newExpense, splitType: value })
                              }
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
                            <div className="grid grid-cols-2 gap-2">
                              {filteredPeople.map((person) => (
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
                                <div className="space-y-3">
                                  {newExpense.participants.map((participantId) => (
                                    <div key={participantId} className="space-y-1">
                                      <div className="flex justify-between">
                                        <Label className="flex items-center gap-1">
                                          <span
                                            className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}
                                          ></span>
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
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </SheetClose>
                          <Button onClick={addExpense}>Add Expense</Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add New Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Add New Expense</DialogTitle>
                          <DialogDescription>Enter the details of the expense</DialogDescription>
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
                                  {filteredPeople.map((person) => (
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
                              <DatePicker
                                date={newExpense.date}
                                setDate={(date) => setNewExpense({ ...newExpense, date })}
                              />
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
                                <span className="text-sm font-medium">{currencySymbol}</span>
                                <Input
                                  id="amount"
                                  placeholder="Enter Amount"
                                  type="number"
                                  value={newExpense.amount || ""}
                                  onChange={(e) =>
                                    setNewExpense({ ...newExpense, amount: Number.parseFloat(e.target.value) || 0 })
                                  }
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
                                      {method.icon}
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
                              {filteredPeople.map((person) => (
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
                                          <span
                                            className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}
                                          ></span>
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
                          <Button onClick={addExpense}>Add Expense</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Receipt className="h-6 w-6 text-yellow-600 mr-2" />
                    Recent Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {filteredExpenses.length === 0 ? (
                        <div className="text-center py-8">
                          <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                          <p className="text-muted-foreground mt-2">No expenses found</p>
                          {(searchQuery || filterCategory || filterDateFrom || filterDateTo) && (
                            <Button variant="link" onClick={resetFilters} className="mt-1">
                              Clear filters
                            </Button>
                          )}
                        </div>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <div
                            key={expense.id}
                            className="border rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                            onClick={() => viewExpenseDetails(expense)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{expense.item}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className={cn("w-2 h-2 rounded-full", getPersonColor(expense.payerId))}></span>
                                  <p className="text-sm text-muted-foreground">
                                    Paid by {getPersonName(expense.payerId)}
                                  </p>
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
                                        {getPaymentMethodDetails(expense.paymentMethod)?.icon}
                                        <span className="ml-1">
                                          {getPaymentMethodDetails(expense.paymentMethod)?.name}
                                        </span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{formatCurrency(expense.amount)}</span>
                                <div className="flex items-center justify-end mt-1">
                                  <p className="text-xs text-muted-foreground mr-1">
                                    {expense.participants.length} people
                                  </p>
                                  {expense.splitType !== "equal" && (
                                    <Badge variant="outline" className="text-xs h-4">
                                      {expense.splitType === "percentage" ? "%" : "$"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Expense Details Dialog */}
              {isMobile ? (
                <Sheet open={isExpenseDetailsOpen} onOpenChange={setIsExpenseDetailsOpen}>
                  <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                    {selectedExpense && (
                      <>
                        <SheetHeader>
                          <SheetTitle>Expense Details</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">{selectedExpense.item}</h3>
                            <Badge variant="outline" className="flex items-center">
                              <span className="mr-1">{getCategoryDetails(selectedExpense.category).icon}</span>
                              {getCategoryDetails(selectedExpense.category).name}
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-lg">{formatCurrency(selectedExpense.amount)}</span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Paid by</span>
                            <div className="flex items-center gap-1">
                              <span
                                className={cn("w-2 h-2 rounded-full", getPersonColor(selectedExpense.payerId))}
                              ></span>
                              <span>{getPersonName(selectedExpense.payerId)}</span>
                            </div>
                          </div>

                          {selectedExpense.paymentMethod && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-muted-foreground">Payment Method</span>
                              <div className="flex items-center gap-1">
                                {getPaymentMethodDetails(selectedExpense.paymentMethod)?.icon}
                                <span>{getPaymentMethodDetails(selectedExpense.paymentMethod)?.name}</span>
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
                                      <span
                                        className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}
                                      ></span>
                                      <span>{getPersonName(participantId)}</span>
                                    </div>
                                    <span className="font-medium">
                                      {selectedExpense.splitType === "percentage" && selectedExpense.customSplits
                                        ? formatCurrency(
                                            (selectedExpense.amount * selectedExpense.customSplits[participantId]) /
                                              100,
                                          )
                                        : selectedExpense.customSplits
                                          ? formatCurrency(selectedExpense.customSplits[participantId])
                                          : formatCurrency(
                                              selectedExpense.amount / selectedExpense.participants.length,
                                            )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {selectedExpense.notes && (
                            <div className="py-2 border-b">
                              <p className="text-muted-foreground mb-1">Notes</p>
                              <p>{selectedExpense.notes}</p>
                            </div>
                          )}

                          {selectedExpense.receipt && (
                            <div className="py-2 border-b">
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
                        <SheetFooter>
                          <Button variant="destructive" onClick={() => deleteExpense(selectedExpense.id)}>
                            Delete Expense
                          </Button>
                        </SheetFooter>
                      </>
                    )}
                  </SheetContent>
                </Sheet>
              ) : (
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
                                  <span
                                    className={cn("w-2 h-2 rounded-full", getPersonColor(selectedExpense.payerId))}
                                  ></span>
                                  <span>{getPersonName(selectedExpense.payerId)}</span>
                                </div>
                              </div>

                              {selectedExpense.paymentMethod && (
                                <div className="flex justify-between items-center py-2 border-b">
                                  <span className="text-muted-foreground">Payment Method</span>
                                  <div className="flex items-center gap-1">
                                    {getPaymentMethodDetails(selectedExpense.paymentMethod)?.icon}
                                    <span>{getPaymentMethodDetails(selectedExpense.paymentMethod)?.name}</span>
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
                                      <span
                                        className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}
                                      ></span>
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
                                          <span
                                            className={cn("w-2 h-2 rounded-full", getPersonColor(participantId))}
                                          ></span>
                                          <span>{getPersonName(participantId)}</span>
                                        </div>
                                        <span className="font-medium">
                                          {selectedExpense.splitType === "percentage" && selectedExpense.customSplits
                                            ? formatCurrency(
                                                (selectedExpense.amount * selectedExpense.customSplits[participantId]) /
                                                  100,
                                              )
                                            : selectedExpense.customSplits
                                              ? formatCurrency(selectedExpense.customSplits[participantId])
                                              : formatCurrency(
                                                  selectedExpense.amount / selectedExpense.participants.length,
                                                )}
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
                          <Button variant="destructive" onClick={() => deleteExpense(selectedExpense.id)}>
                            Delete Expense
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <FolderOpen className="h-6 w-6 text-purple-600 mr-2" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPeople.map((person) => {
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <DollarSign className="h-6 w-6 text-yellow-600 mr-2" />
                    Recent Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 bg-secondary p-3">
                      <div className="font-medium">Payer</div>
                      <div className="font-medium">Item</div>
                      <div className="font-medium text-right">Amount</div>
                    </div>
                    <div className="divide-y">
                      {filteredExpenses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No expenses yet</p>
                      ) : (
                        filteredExpenses.map((expense) => (
                          <div
                            key={expense.id}
                            className="p-3 hover:bg-accent hover:text-accent-foreground transition-colors group"
                          >
                            <div className="grid grid-cols-3">
                              <div className="flex items-center gap-1">
                                <span className={cn("w-2 h-2 rounded-full", getPersonColor(expense.payerId))}></span>
                                <span>{getPersonName(expense.payerId)}</span>
                              </div>
                              <div>{expense.item}</div>
                              <div className="text-right font-medium flex items-center justify-end">
                                {formatCurrency(expense.amount)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteExpense(expense.id)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <ArrowRight className="h-6 w-6 text-orange-600 mr-2" />
                    Settlement Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {calculateSettlement().length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Everyone is settled up!</p>
                    ) : (
                      calculateSettlement().map((settlement, index) => (
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <PieChart className="h-6 w-6 text-indigo-600 mr-2" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <h3 className="text-sm text-muted-foreground">Total Trip Expenses</h3>
                    <p className="text-3xl font-bold">{formatCurrency(totalTripExpenses)}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {calculateCategoryTotals().map((category) => (
                        <div key={category.category} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="mr-2">{getCategoryDetails(category.category).icon}</span>
                              <span>{getCategoryDetails(category.category).name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(category.amount)}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                ({category.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center">
                      <ExpenseChart
                        data={calculateCategoryTotals().map((cat) => ({
                          name: getCategoryDetails(cat.category).name,
                          value: cat.amount,
                          icon: getCategoryDetails(cat.category).icon,
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-6 w-6 text-yellow-600 mr-2" />
                    Payment Champions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPeople.map((person) => {
                      // Calculate how much this person has paid in total
                      const totalPaid = filteredExpenses
                        .filter((expense) => expense.payerId === person.id)
                        .reduce((sum, expense) => sum + expense.amount, 0)

                      // Calculate percentage of total expenses
                      const percentage = totalTripExpenses > 0 ? (totalPaid / totalTripExpenses) * 100 : 0

                      // Calculate payment frequency
                      const frequency = paymentFrequency[person.id] || 0
                      const frequencyPercentage = maxFrequency > 0 ? (frequency / maxFrequency) * 100 : 0

                      return (
                        <div key={person.id} className="space-y-3">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                              <span className="font-medium">{person.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(totalPaid)}</span>
                              <span className="text-muted-foreground text-sm ml-2">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Frequency</span>
                            <span className="text-muted-foreground">{frequency} times</span>
                          </div>
                          <Progress value={frequencyPercentage} className="h-1" indicatorClassName="bg-blue-400" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Ban className="h-6 w-6 text-red-600 mr-2" />
                    Non-Payers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nonPayers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Everyone has contributed!</p>
                  ) : (
                    <div className="space-y-2">
                      {nonPayers.map((person) => (
                        <div
                          key={person.id}
                          className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <div className="flex items-center gap-1">
                              <span className={cn("w-2 h-2 rounded-full", person.color)}></span>
                              <span>{person.name} hasn't paid for anything yet</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Clock className="h-6 w-6 text-green-600 mr-2" />
                    Expense Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="relative pl-6 border-l border-muted">
                      {filteredExpenses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No expenses yet</p>
                      ) : (
                        filteredExpenses
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((expense) => (
                            <div key={expense.id} className="mb-6 relative">
                              <div className="absolute -left-3 mt-1.5 h-5 w-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                <span className="text-xs">{getCategoryDetails(expense.category).icon}</span>
                              </div>
                              <div className="border rounded-lg p-3 ml-4 group hover:bg-accent hover:text-accent-foreground transition-colors">
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(expense.date), "MMMM d, yyyy")}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                  <h3 className="font-medium">{expense.item}</h3>
                                  <div className="flex items-center">
                                    <span className="font-bold">{formatCurrency(expense.amount)}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100"
                                      onClick={() => deleteExpense(expense.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className={cn("w-2 h-2 rounded-full", getPersonColor(expense.payerId))}></span>
                                  <p className="text-sm text-muted-foreground">
                                    Paid by {getPersonName(expense.payerId)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Person Confirmation Dialog */}
      <AlertDialog open={isDeletePersonDialogOpen} onOpenChange={setIsDeletePersonDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {personToDelete?.name} from the trip. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePerson}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Trip Confirmation Dialog */}
      <AlertDialog open={isDeleteTripDialogOpen} onOpenChange={setIsDeleteTripDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the trip "{tripToDelete?.name}" and all associated people and expenses. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTrip}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>Customize your expense tracker experience</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger id="defaultCurrency">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span>{currency.symbol}</span>
                        <span>{currency.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave">Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save data to local storage</p>
              </div>
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable in-app notifications</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
              />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={saveSettings}>Save Settings</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

