"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { updateTransactionStatus } from "@/app/actions/transactions"
import type { Transaction } from "@/app/actions/transactions"

interface TransactionActionsProps {
  transaction: Transaction
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (status: string) => {
    if (isUpdating) return

    setIsUpdating(true)

    try {
      const result = await updateTransactionStatus(transaction.id, status)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Transaction status updated to ${status}`,
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={transaction.status === "pending" || isUpdating}
          onClick={() => handleStatusUpdate("pending")}
        >
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={transaction.status === "processing" || isUpdating}
          onClick={() => handleStatusUpdate("processing")}
        >
          Mark as Processing
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={transaction.status === "shipped" || isUpdating}
          onClick={() => handleStatusUpdate("shipped")}
        >
          Mark as Shipped
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={transaction.status === "delivered" || isUpdating}
          onClick={() => handleStatusUpdate("delivered")}
        >
          Mark as Delivered
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={transaction.status === "cancelled" || isUpdating}
          onClick={() => handleStatusUpdate("cancelled")}
          className="text-red-500"
        >
          Cancel Transaction
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
