"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    const expiryTime = localStorage.getItem("authExpiry")

    if (storedUser && expiryTime) {
      const now = new Date().getTime()
      if (Number.parseInt(expiryTime) > now) {
        setUser(JSON.parse(storedUser))
      } else {
        // Token expired, clear storage
        localStorage.removeItem("user")
        localStorage.removeItem("authExpiry")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would validate credentials with an API
    // For demo purposes, we'll create a mock user
    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email: email,
    }

    setUser(mockUser)

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(mockUser))

    // Set expiry time (20 days if rememberMe is true, 1 day otherwise)
    const expiryDays = rememberMe ? 20 : 1
    const expiryTime = new Date().getTime() + expiryDays * 24 * 60 * 60 * 1000
    localStorage.setItem("authExpiry", expiryTime.toString())

    setIsLoading(false)
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create a new user
    const newUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
    }

    setUser(newUser)

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(newUser))

    // Set expiry time (1 day by default for new signups)
    const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000
    localStorage.setItem("authExpiry", expiryTime.toString())

    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("authExpiry")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

