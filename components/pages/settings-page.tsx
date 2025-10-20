// File: E:/projects/sorties/task-management/task-manager-app/components/pages/settings-page.tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { useTasks } from "@/hooks/use-tasks"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskPriority, TaskCategory } from "@/lib/schemas"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSettings, AIModel } from "@/contexts/settings-provider" // Import from settings context

export function SettingsPageContent() {
  const { tasks, fetchTasks } = useTasks()
  const { toast } = useToast()
  const router = useRouter()
  const { defaultModel, setDefaultModel } = useSettings() // Use the new context

  // State for default values
  const [defaultPriority, setDefaultPriority] = React.useState<TaskPriority | undefined>(undefined);
  const [defaultCategory, setDefaultCategory] = React.useState<TaskCategory | undefined>(undefined);

  React.useEffect(() => {
    // Load saved defaults from localStorage on component mount
    const savedPriority = localStorage.getItem("defaultPriority") as TaskPriority | null
    const savedCategory = localStorage.getItem("defaultCategory") as TaskCategory | null
    if (savedPriority) setDefaultPriority(savedPriority)
    if (savedCategory) setDefaultCategory(savedCategory)
  }, [])

  const handlePriorityChange = (value: TaskPriority) => {
    setDefaultPriority(value)
    localStorage.setItem("defaultPriority", value)
    toast({ title: "Default priority saved!" })
  }

  const handleCategoryChange = (value: TaskCategory) => {
    setDefaultCategory(value)
    localStorage.setItem("defaultCategory", value)
    toast({ title: "Default category saved!" })
  }

  const handleModelChange = (value: AIModel) => {
    setDefaultModel(value)
    toast({ title: "Default AI Model Saved!", description: `Your new default is ${value}.` })
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tasks-${new Date().toISOString()}.json`
    link.click()
  }

  const handleDeleteAllData = async () => {
    try {
      const response = await fetch('/api/tasks/all', { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete data.");
      toast({ title: "All Data Deleted", description: "Your tasks and notes have been cleared." });
      // We need a way to refetch all data across the app. A page reload is the simplest way.
      window.location.reload();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete your data." });
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
            <CardDescription>Choose your preferred AI model for chat and generation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Default AI Model</Label>
              <Select onValueChange={handleModelChange} value={defaultModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a default model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                  <SelectItem value="gemini-1.5-pro-latest">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Default Task Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Task Defaults</CardTitle>
            <CardDescription>Set default values for new tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Priority</Label>
              <Select onValueChange={handlePriorityChange} value={defaultPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a default priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Category</Label>
              <Select onValueChange={handleCategoryChange} value={defaultCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a default category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportData} variant="outline" className="w-full bg-transparent">
              Export All Data as JSON
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete All Tasks and Notes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all of your tasks and notes from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllData}>
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
