import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import UserProfile from "@/components/user-profile"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    </main>
  )
}

