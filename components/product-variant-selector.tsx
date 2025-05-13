"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Size {
  id: string
  name: string
  display_order: number
}

interface Variant {
  id: string
  inventory_count: number
  sizes: Size
}

interface ProductVariantSelectorProps {
  variants: Variant[]
  onVariantChange?: (variantId: string | null, stockCount: number) => void
}

export function ProductVariantSelector({ variants, onVariantChange }: ProductVariantSelectorProps) {
  // Find the first variant with stock
  const defaultVariant = variants.find((v) => v.inventory_count > 0) || variants[0]

  // Initialize state with the default variant
  const [selectedVariant, setSelectedVariant] = useState<string | null>(defaultVariant?.id || null)

  // Sort variants by size display order
  const sortedVariants = [...variants].sort((a, b) => (a.sizes?.display_order || 0) - (b.sizes?.display_order || 0))

  // Get the current selected variant object
  const currentVariant = variants.find((v) => v.id === selectedVariant)
  const selectedVariantStock = currentVariant?.inventory_count || 0

  // Notify parent component when variant changes
  useEffect(() => {
    if (onVariantChange && selectedVariant) {
      onVariantChange(selectedVariant, selectedVariantStock)
    }
  }, [selectedVariant, selectedVariantStock, onVariantChange])

  // Handle variant selection change
  const handleVariantChange = (value: string) => {
    console.log("Size selected:", value)
    setSelectedVariant(value)
  }

  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Size</h3>
        {selectedVariant && (
          <div className="text-sm text-neutral-500">
            {selectedVariantStock > 0 ? (
              <span className={selectedVariantStock <= 5 ? "text-amber-600 dark:text-amber-400" : ""}>
                {selectedVariantStock} in stock
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Out of stock</span>
            )}
          </div>
        )}
      </div>

      <RadioGroup value={selectedVariant || ""} onValueChange={handleVariantChange} className="flex flex-wrap gap-2">
        {sortedVariants.map((variant) => {
          const isOutOfStock = variant.inventory_count === 0
          const isSelected = selectedVariant === variant.id

          return (
            <div key={variant.id} className="flex items-center">
              <RadioGroupItem
                value={variant.id}
                id={`size-${variant.id}`}
                disabled={isOutOfStock}
                className="peer sr-only"
                aria-label={`Size ${variant.sizes?.name}`}
              />
              <Label
                htmlFor={`size-${variant.id}`}
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium
                  ${
                    isOutOfStock
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
                      : "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }
                  ${
                    isSelected && !isOutOfStock
                      ? "border-black bg-neutral-100 text-black dark:border-white dark:bg-neutral-800 dark:text-white"
                      : ""
                  }
                `}
                data-selected={isSelected}
              >
                {variant.sizes?.name}
                {isOutOfStock && <span className="sr-only"> (Out of stock)</span>}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
