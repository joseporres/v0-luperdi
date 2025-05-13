import Link from "next/link"
import Image from "next/image"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InventoryManager } from "@/components/admin/inventory-manager"
import type { Database } from "@/lib/supabase/database.types"

export default async function InventoryPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get products with variants and sizes
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, 
      name, 
      image_url, 
      category,
      collections(id, name),
      product_variants(
        id, 
        inventory_count, 
        sizes(id, name, display_order)
      )
    `)
    .order("name")

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add New Product</Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-md shadow">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="font-semibold">Product Inventory</h2>
          <p className="text-sm text-neutral-500">Manage stock levels for all products and variants</p>
        </div>

        <div className="p-4">
          {products?.map((product) => {
            const variants = product.product_variants || []
            const totalInventory = variants.reduce((sum, variant) => sum + variant.inventory_count, 0)
            const hasLowStock = variants.some((v) => v.inventory_count > 0 && v.inventory_count < 10)
            const hasOutOfStock = variants.some((v) => v.inventory_count === 0)

            return (
              <div key={product.id} className="mb-8 last:mb-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-md overflow-hidden">
                    <Image
                      src={product.image_url || "/placeholder.svg?height=64&width=64"}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                      {product.collections && <Badge>{product.collections.name}</Badge>}
                      {hasOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
                      {hasLowStock && <Badge variant="secondary">Low Stock</Badge>}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-medium">Total Inventory</div>
                    <div className="text-2xl">{totalInventory}</div>
                  </div>
                </div>

                <InventoryManager product={product} />
              </div>
            )
          })}

          {products?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-neutral-500">No products found. Add products to manage inventory.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/products/new">Add New Product</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
