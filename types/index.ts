export interface Trip {
  id: string
  userId: string
  name: string
  description?: string
  startDate?: Date
  endDate?: Date
  currency: string
  budget?: number
  createdAt: Date
  updatedAt: Date
  memberCount: number
  totalExpenses: number
}

export interface Person {
  id: string
  tripId: string
  name: string
  email?: string
  color?: string
}

export interface Expense {
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
  createdAt: Date
}

export interface Settlement {
  id: string
  tripId: string
  fromPersonId: string
  toPersonId: string
  amount: number
  date: Date
  method: string
  notes?: string
  createdAt: Date
}

export interface CategoryTotal {
  category: string
  amount: number
  percentage: number
}

