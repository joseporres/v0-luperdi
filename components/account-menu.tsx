"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { LogIn, LogOut, Settings, ShoppingBag, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AccountMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("login")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
          return
        }
        setIsLoggedIn(!!data.session)
        setUser(data.session?.user || null)
      } catch (error) {
        console.error("Error checking user:", error)
      }
    }

    checkUser()

    // Only set up the auth state change listener if the method exists
    let subscription = { unsubscribe: () => {} }

    try {
      if (supabase.auth.onAuthStateChange) {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setIsLoggedIn(!!session)
          setUser(session?.user || null)
          router.refresh()
        })
        subscription = data.subscription
      } else {
        console.warn("supabase.auth.onAuthStateChange is not available")
        // Set up a polling mechanism as a fallback
        const interval = setInterval(checkUser, 5000)
        subscription = { unsubscribe: () => clearInterval(interval) }
      }
    } catch (error) {
      console.error("Error setting up auth state change listener:", error)
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      // Use the client-side Supabase instance directly for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("Login failed with error:", error.message)
        setErrorMessage(error.message)
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log("Login successful")
        setIsDialogOpen(false)
        toast({
          title: "Success",
          description: "You have been logged in successfully.",
        })
        router.refresh()
      }
    } catch (error: any) {
      console.error("Login error:", error)
      // Handle redirect errors specifically
      if (error.message && error.message.includes("redirect")) {
        setErrorMessage("Authentication requires a page reload. Please try again.")
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.")
      }
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const firstName = formData.get("first-name") as string
      const lastName = formData.get("last-name") as string

      // Use client-side Supabase directly for signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        console.log("Signup failed with error:", error.message)
        setErrorMessage(error.message)
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (data?.user?.identities?.length === 0) {
        // User already exists
        setErrorMessage("An account with this email already exists")
        toast({
          title: "Signup Failed",
          description: "An account with this email already exists",
          variant: "destructive",
        })
      } else {
        console.log("Signup successful")
        setSuccessMessage("Your account has been created. Please check your email for verification.")
        toast({
          title: "Success",
          description: "Your account has been created. Please check your email for verification.",
        })
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      // Handle redirect errors specifically
      if (error.message && error.message.includes("redirect")) {
        setErrorMessage("Authentication requires a page reload. Please try again.")
      } else {
        setErrorMessage("An unexpected error occurred during signup. Please try again.")
      }
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Use client-side Supabase directly for logout
      await supabase.auth.signOut()
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Purchase History</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <DialogHeader>
                    <DialogTitle>Login to your account</DialogTitle>
                    <DialogDescription>Enter your email and password to access your account.</DialogDescription>
                  </DialogHeader>
                  {errorMessage && (
                    <Alert variant="destructive" className="my-4">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert className="my-4 bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="text-xs text-neutral-500 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input id="password" name="password" type="password" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </DialogFooter>
                  <div className="mt-4 text-center text-sm">
                    <span className="text-neutral-500">Don't have an account? </span>
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setActiveTab("signup")}
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <DialogHeader>
                    <DialogTitle>Create an account</DialogTitle>
                    <DialogDescription>Enter your details to create a new account.</DialogDescription>
                  </DialogHeader>
                  {errorMessage && (
                    <Alert variant="destructive" className="my-4">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert className="my-4 bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" name="first-name" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" name="last-name" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="name@example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" name="password" type="password" required />
                      <p className="text-xs text-neutral-500">Password must be at least 6 characters</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </DialogFooter>
                  <div className="mt-4 text-center text-sm">
                    <span className="text-neutral-500">Already have an account? </span>
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
