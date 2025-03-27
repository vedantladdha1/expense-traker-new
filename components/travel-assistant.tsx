"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Send, Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Sample responses for common travel questions
const ASSISTANT_RESPONSES: Record<string, string> = {
  hello: "Hello! I'm your travel assistant. How can I help you with your trip planning or expense tracking today?",
  hi: "Hi there! I'm here to help with your travel plans and expenses. What can I assist you with?",
  help: "I can help you with various travel-related questions such as:\n\n- Trip planning advice\n- Expense splitting tips\n- Budget management\n- Travel recommendations\n- How to use TripSplit features\n\nJust ask me anything!",
  features:
    "TripSplit offers several features to make your trip expense management easier:\n\n- Create trips and add friends\n- Track expenses with multiple currencies\n- Record settlements between friends\n- View detailed analytics of your spending\n- Split expenses equally or with custom amounts\n- Export your expense data",
  "split expenses":
    "To split expenses in TripSplit:\n\n1. Create a trip and add all participants\n2. Add expenses as they occur, selecting who paid and who should share the cost\n3. Choose between equal splits, percentage splits, or custom amount splits\n4. Use the Summary tab to see who owes what\n5. Record settlements when people pay each other back",
  budget:
    "Managing your budget in TripSplit is easy:\n\n1. Set a budget when creating your trip\n2. Track your expenses as you go\n3. View the budget progress bar to see how much you've spent\n4. Use the Analytics tab to see spending by category\n5. Get alerts when you're approaching or exceeding your budget",
  settlement:
    "Settlements in TripSplit allow you to record when someone pays back money they owe:\n\n1. Go to the Settlements tab in your trip\n2. Click 'Record Settlement'\n3. Select who paid, who received, and the amount\n4. Add the payment method and any notes\n5. The settlement will be reflected in the overall balances",
  currency:
    "TripSplit supports multiple currencies:\n\n1. Set your trip's default currency when creating it\n2. All expenses will be tracked in that currency\n3. You can change your preferred currency in Settings\n4. The app will display amounts in your selected currency",
  "export data":
    "To export your expense data:\n\n1. Go to your trip\n2. Click on the download icon in the top right\n3. Choose 'Export as CSV'\n4. The file will download with all your expense details\n5. You can open this file in Excel or Google Sheets",
  offline:
    "TripSplit works offline! Your data is stored locally on your device, so you can:\n\n1. Add expenses without internet connection\n2. View your trip details offline\n3. Record settlements\n4. When you reconnect, your data will be synced",
  delete:
    "To delete data in TripSplit:\n\n- To delete an expense: Go to the expense details and click the trash icon\n- To delete a person: Go to the People tab and click the trash icon next to their name\n- To delete a settlement: Go to the Settlements tab and click the trash icon next to the settlement\n- To delete a trip: Go to Dashboard and click the delete button on the trip card",
  privacy:
    "TripSplit takes your privacy seriously:\n\n- Your data is stored locally on your device\n- We don't share your information with third parties\n- Your expense details are only visible to you and the people you share your trip with\n- You can delete your data at any time",
}

export default function TravelAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi there! I'm your travel assistant. I can help with trip planning, expense splitting, and answer questions about using TripSplit. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const response = getAssistantResponse(input.toLowerCase())

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const getAssistantResponse = (query: string): string => {
    // Check for exact matches
    for (const [key, response] of Object.entries(ASSISTANT_RESPONSES)) {
      if (query.includes(key)) {
        return response
      }
    }

    // Handle general queries
    if (query.includes("trip") || query.includes("travel")) {
      return "Planning a trip involves several steps like choosing a destination, setting a budget, and organizing accommodations. With TripSplit, you can easily track all your expenses and split them with your travel companions."
    }

    if (query.includes("expense") || query.includes("cost") || query.includes("money")) {
      return "Managing expenses is easy with TripSplit. You can add expenses, choose who paid and who should share the cost, and see a summary of who owes what. You can also record settlements when people pay each other back."
    }

    if (query.includes("recommend") || query.includes("suggest") || query.includes("where")) {
      return "I'd be happy to suggest some destinations! Popular choices include beach destinations like Bali or Thailand, cultural experiences in Europe, or adventure trips to mountains or national parks. What kind of experience are you looking for?"
    }

    // Default response
    return "I'm not sure I understand your question. You can ask me about trip planning, expense splitting, budget management, or how to use specific features in TripSplit."
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Travel Assistant"
        text="Ask questions about trip planning, expense splitting, or using TripSplit."
      />

      <Card className="h-[calc(100vh-220px)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            TripSplit Assistant
          </CardTitle>
          <CardDescription>Your AI travel companion for trip planning and expense management</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-350px)] px-4">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "assistant" ? "" : "flex-row-reverse"}`}>
                    <Avatar className="h-8 w-8">
                      {message.role === "assistant" ? (
                        <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted text-foreground">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form
            className="flex w-full items-center space-x-2"
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
          >
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
}

