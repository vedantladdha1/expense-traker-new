"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Trip } from "@/types"
import { Plus, Trash2, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePeople } from "@/hooks/use-people"

interface PeopleTabProps {
  trip: Trip
}

export function PeopleTab({ trip }: PeopleTabProps) {
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false)
  const [newPersonName, setNewPersonName] = useState("")
  const [newPersonEmail, setNewPersonEmail] = useState("")

  const { people, addPerson, deletePerson } = usePeople(trip.id)
  const { toast } = useToast()

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the person.",
        variant: "destructive",
      })
      return
    }

    addPerson({
      name: newPersonName.trim(),
      email: newPersonEmail.trim() || undefined,
      color: getRandomColor(),
    })

    setNewPersonName("")
    setNewPersonEmail("")
    setIsAddPersonOpen(false)

    toast({
      title: "Person added",
      description: `${newPersonName} has been added to the trip.`,
    })
  }

  const handleDeletePerson = (personId: string, personName: string) => {
    deletePerson(personId)

    toast({
      title: "Person removed",
      description: `${personName} has been removed from the trip.`,
    })
  }

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">People</h2>
        <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
              <DialogDescription>Add a new person to your trip for expense splitting.</DialogDescription>
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
              <Button variant="outline" onClick={() => setIsAddPersonOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPerson}>Add Person</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {people.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No people added to this trip yet</p>
            <Button onClick={() => setIsAddPersonOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Trip Members</CardTitle>
            <CardDescription>People who are part of this trip and can split expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`${person.color} text-white`}>
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{person.name}</h3>
                        {person.email && (
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            <span>{person.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeletePerson(person.id, person.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

