"use client"

import { useState, useEffect } from "react"
import { ProductVariantSelector } from "./product-variant-selector"
import { AddToCartButton } from "./add-to-cart-button"

export function ProductVariantSelectorWrapper({ product }) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [stockCount, setStockCount] = useState<number>(0)

  // Initialize with the first in-stock variant
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const firstInStockVariant = product.variants.find((v) => v.inventory_count > 0) || product.variants[0]
      if (firstInStockVariant) {
        setSelectedVariant(firstInStockVariant.id)
        setStockCount(firstInStockVariant.inventory_count)
      }
    }
  }, [product.variants])

  const handleVariantChange = (variantId: string | null, variantStockCount: number) => {
    console.log("Variant changed:", variantId, "Stock:", variantStockCount)
    setSelectedVariant(variantId)
    setStockCount(variantStockCount)
  }

  // Get the current selected variant object for display
  const currentVariant = product.variants?.find((v) => v.id === selectedVariant)
  const currentSize = currentVariant?.sizes?.name || "Default"

  return (
    <div className="space-y-6">
      <ProductVariantSelector variants={product.variants || []} onVariantChange={handleVariantChange} />

      {selectedVariant && (
        <div className="text-sm">
          <span className="font-medium">Selected size:</span> {currentSize}
        </div>
      )}

      <AddToCartButton
        productId={product.id}
        variantId={selectedVariant}
        disabled={!selectedVariant || stockCount <= 0}
        stockCount={stockCount}
      />
    </div>
  )
}
