"use client"

import { useStockSync } from "@/hooks/use-stock-sync"
import { Badge } from "@/components/ui/badge"

interface RealTimeStockIndicatorProps {
  productId: string
  variantId?: string
  showBadge?: boolean
  className?: string
}

export function RealTimeStockIndicator({
  productId,
  variantId,
  showBadge = true,
  className = "",
}: RealTimeStockIndicatorProps) {
  const { stockCount, isLoading } = useStockSync(productId, variantId)

  if (isLoading) {
    return <span className={`text-sm text-neutral-500 ${className}`}>Checking stock...</span>
  }

  const isOutOfStock = stockCount === 0
  const isLowStock = stockCount !== null && stockCount > 0 && stockCount <= 5

  return (
    <div className={className}>
      {showBadge ? (
        <>
          {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
          {isLowStock && <Badge variant="secondary">Low Stock: {stockCount} left</Badge>}
          {!isOutOfStock && !isLowStock && stockCount !== null && (
            <span className="text-sm text-neutral-500">{stockCount} in stock</span>
          )}
        </>
      ) : (
        <span
          className={`text-sm ${isOutOfStock ? "text-red-600 dark:text-red-400" : isLowStock ? "text-amber-600 dark:text-amber-400" : "text-neutral-500"}`}
        >
          {isOutOfStock ? "Out of stock" : `${stockCount} in stock${isLowStock ? " (Low)" : ""}`}
        </span>
      )}
    </div>
  )
}
