"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { updateProductVariantInventory } from "@/app/actions/products"

interface InventoryManagerProps {
  product: any // Using any for simplicity, but should be properly typed
}

export function InventoryManager({ product }: InventoryManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [inventory, setInventory] = useState<Record<string, number>>(
    Object.fromEntries((product.product_variants || []).map((variant: any) => [variant.id, variant.inventory_count])),
  )

  const handleInventoryChange = (variantId: string, value: string) => {
    const count = Number.parseInt(value, 10)
    if (!isNaN(count) && count >= 0) {
      setInventory((prev) => ({ ...prev, [variantId]: count }))
    }
  }

  const handleIncrement = (variantId: string) => {
    setInventory((prev) => ({
      ...prev,
      [variantId]: (prev[variantId] || 0) + 1,
    }))
  }

  const handleDecrement = (variantId: string) => {
    setInventory((prev) => ({
      ...prev,
      [variantId]: Math.max(0, (prev[variantId] || 0) - 1),
    }))
  }

  const updateInventory = async (variantId: string) => {
    setIsUpdating((prev) => ({ ...prev, [variantId]: true }))

    try {
      const currentCount = inventory[variantId] || 0
      const result = await updateProductVariantInventory(variantId, currentCount, "Manual adjustment from admin")

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Inventory updated successfully",
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
      setIsUpdating((prev) => ({ ...prev, [variantId]: false }))
    }
  }

  // Sort variants by size display order
  const sortedVariants = [...(product.product_variants || [])].sort((a, b) => {
    return (a.sizes?.display_order || 0) - (b.sizes?.display_order || 0)
  })

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-md p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {sortedVariants.map((variant: any) => {
          const variantId = variant.id
          const sizeName = variant.sizes?.name || "Unknown"
          const count = inventory[variantId] || 0
          const isLowStock = count > 0 && count < 10
          const isOutOfStock = count === 0

          return (
            <div
              key={variantId}
              className={`
                border rounded-md p-3
                ${isOutOfStock ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20" : ""}
                ${isLowStock ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20" : ""}
                ${!isOutOfStock && !isLowStock ? "border-neutral-200 dark:border-neutral-700" : ""}
              `}
            >
              <div className="text-sm font-medium mb-2">Size {sizeName}</div>

              <div className="flex items-center mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => handleDecrement(variantId)}
                >
                  <Minus className="h-3 w-3" />
                  <span className="sr-only">Decrease</span>
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => handleInventoryChange(variantId, e.target.value)}
                  className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => handleIncrement(variantId)}
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Increase</span>
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={isUpdating[variantId]}
                onClick={() => updateInventory(variantId)}
              >
                {isUpdating[variantId] ? "Updating..." : "Update"}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
