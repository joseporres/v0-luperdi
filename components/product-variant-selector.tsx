"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ProductVariant } from "@/app/actions/products"

interface ProductVariantSelectorProps {
  variants: ProductVariant[]
}

export function ProductVariantSelector({ variants }: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variants.find((v) => v.inventory_count > 0)?.id || null,
  )

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Size</h3>
      <RadioGroup
        value={selectedVariant || undefined}
        onValueChange={setSelectedVariant}
        className="flex flex-wrap gap-2"
      >
        {variants.map((variant) => {
          const size = variant.sizes
          const isOutOfStock = variant.inventory_count === 0

          return (
            <div key={variant.id} className="flex items-center">
              <RadioGroupItem value={variant.id} id={variant.id} disabled={isOutOfStock} className="peer sr-only" />
              <Label
                htmlFor={variant.id}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium 
                  ${
                    isOutOfStock
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
                      : "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-neutral-100 dark:peer-data-[state=checked]:border-white dark:peer-data-[state=checked]:bg-neutral-800"
                  }`}
              >
                {size?.name}
                {isOutOfStock && <span className="sr-only"> (Out of stock)</span>}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
      {selectedVariant && (
        <div className="mt-2 text-sm text-neutral-500">
          {variants.find((v) => v.id === selectedVariant)?.inventory_count} in stock
        </div>
      )}
    </div>
  )
}
