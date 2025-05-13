"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useStockSync(productId: string, variantId?: string) {
  const [stockCount, setStockCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch of stock data
    const fetchStockData = async () => {
      setIsLoading(true)
      try {
        let query = supabase.from("product_variants").select("inventory_count")

        if (variantId) {
          // If we have a specific variant ID, query just that one
          query = query.eq("id", variantId)
        } else {
          // Otherwise, get all variants for the product
          query = query.eq("product_id", productId)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        if (variantId) {
          // For a specific variant, set its stock count
          setStockCount(data?.[0]?.inventory_count || 0)
        } else {
          // For a product, sum up all variant stock counts
          const totalStock = data?.reduce((sum, variant) => sum + (variant.inventory_count || 0), 0) || 0
          setStockCount(totalStock)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error fetching stock data"))
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch initial data
    fetchStockData()

    // Set up real-time subscription
    const channel = supabase
      .channel(`product_stock_${productId}${variantId ? `_${variantId}` : ""}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "product_variants",
          filter: variantId ? `id=eq.${variantId}` : `product_id=eq.${productId}`,
        },
        (payload) => {
          // When we get an update, refresh the stock data
          fetchStockData()
        },
      )
      .subscribe()

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, variantId])

  return { stockCount, isLoading, error }
}
