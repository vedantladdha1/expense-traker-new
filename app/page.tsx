import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import LandingPage from "@/components/landing-page"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <LandingPage />
      </Suspense>
    </main>
  )
}

