"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DollarSign } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <DollarSign className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl hidden sm:inline-block">TripSplit</span>
      </Link>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/dashboard"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/profile"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard/profile" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Profile
        </Link>
        <Link
          href="/dashboard/assistant"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard/assistant" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Assistant
        </Link>
      </nav>
    </div>
  )
}

