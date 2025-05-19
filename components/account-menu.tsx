"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, ShoppingBag } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"
import { useToast } from "@/components/ui/use-toast"

interface AccountMenuProps {
  userEmail?: string | null
}

export function AccountMenu({ userEmail }: AccountMenuProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = () => {
    router.push("/login")
  }

  const handleLogout = async () => {
    try {
      const result = await signOut()

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Refresh the page to update the UI
      router.refresh()

      toast({
        title: "Success",
        description: "You have been logged out",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  if (!userEmail) {
    return (
      <Button variant="ghost" size="icon" onClick={handleLogin} className="rounded-full">
        <User className="h-5 w-5" />
        <span className="sr-only">Login</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="cursor-pointer">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
