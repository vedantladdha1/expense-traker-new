import type { Expense, Person, Trip } from "@/types"

export interface EmailNotification {
  to: string
  subject: string
  body: string
  sentAt: Date
  status: "sent" | "failed"
}

class NotificationService {
  private notifications: EmailNotification[] = []
  private subscribers: ((notification: EmailNotification) => void)[] = []

  constructor() {
    // Load notifications from localStorage if available
    const storedNotifications = localStorage.getItem("email_notifications")
    if (storedNotifications) {
      try {
        this.notifications = JSON.parse(storedNotifications)
      } catch (error) {
        console.error("Failed to parse stored notifications", error)
      }
    }
  }

  // Subscribe to notifications
  subscribe(callback: (notification: EmailNotification) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  // Send expense notification
  async sendExpenseNotification(
    expense: Expense,
    trip: Trip,
    payer: Person,
    participants: Person[],
  ): Promise<EmailNotification> {
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: trip.currency,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    // Create participant list
    const participantsList = participants.map((p) => p.name).join(", ")

    // Create email body
    const emailBody = `
      <h2>New Expense Added to ${trip.name}</h2>
      <p><strong>Item:</strong> ${expense.item}</p>
      <p><strong>Amount:</strong> ${formatCurrency(expense.amount)}</p>
      <p><strong>Category:</strong> ${expense.category}</p>
      <p><strong>Paid by:</strong> ${payer.name}</p>
      <p><strong>Split between:</strong> ${participantsList}</p>
      <p><strong>Date:</strong> ${new Date(expense.date).toLocaleDateString()}</p>
      ${expense.notes ? `<p><strong>Notes:</strong> ${expense.notes}</p>` : ""}
      <p>View all expenses and settlements in your TripSplit dashboard.</p>
    `

    // Create notification object
    const notification: EmailNotification = {
      to: payer.email || "user@example.com",
      subject: `[TripSplit] New Expense: ${expense.item} (${formatCurrency(expense.amount)})`,
      body: emailBody,
      sentAt: new Date(),
      status: "sent",
    }

    // In a real app, we would send an actual email here
    // For demo purposes, we'll just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Store the notification
    this.notifications.push(notification)
    localStorage.setItem("email_notifications", JSON.stringify(this.notifications))

    // Notify subscribers
    this.subscribers.forEach((callback) => callback(notification))

    return notification
  }

  // Get all notifications
  getNotifications(): EmailNotification[] {
    return [...this.notifications]
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = []
    localStorage.removeItem("email_notifications")
  }
}

// Create a singleton instance
export const notificationService = new NotificationService()

