"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { notificationService, type EmailNotification } from "@/lib/notification-service"
import { format } from "date-fns"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications())
    setUnreadCount(notificationService.getNotifications().length)

    // Subscribe to new notifications
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    return () => unsubscribe()
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setUnreadCount(0)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          <p className="text-xs text-muted-foreground">Email notifications for your expenses</p>
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
        ) : (
          <ScrollArea className="h-80">
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div key={index} className="p-4 hover:bg-muted">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">{notification.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(notification.sentAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Sent to: {notification.to}</div>
                  <div className="text-xs mt-2">{notification.body.substring(0, 100).replace(/<[^>]*>/g, "")}...</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

