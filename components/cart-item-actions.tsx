"use client"

import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { removeFromCart, updateCartItem } from "@/lib/cart"
import type { CartItem } from "@/lib/cart"

interface CartItemActionsProps {
  item: CartItem
}

export function CartItemActions({ item }: CartItemActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    setIsLoading(true)
    await updateCartItem(item.id, newQuantity)
    router.refresh()
    setIsLoading(false)
  }

  const handleRemove = async () => {
    setIsLoading(true)
    await removeFromCart(item.id)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none rounded-l-md"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={isLoading || item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none rounded-r-md"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
          disabled={isLoading}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-neutral-500"
        onClick={handleRemove}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove item</span>
      </Button>
    </div>
  )
}
