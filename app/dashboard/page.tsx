import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Dashboard from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}

