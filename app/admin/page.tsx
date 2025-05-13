import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export default async function AdminDashboard() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get counts for dashboard
  const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: collectionsCount } = await supabase.from("collections").select("*", { count: "exact", head: true })

  const { count: lowInventoryCount } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .lt("inventory_count", 10)
    .gt("inventory_count", 0)

  const { count: outOfStockCount } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .eq("inventory_count", 0)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/admin/products" className="text-blue-500 hover:underline">
                Manage products
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/admin/collections" className="text-blue-500 hover:underline">
                Manage collections
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowInventoryCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/admin/inventory" className="text-blue-500 hover:underline">
                View low stock items
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/admin/inventory" className="text-blue-500 hover:underline">
                View out of stock items
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                href="/admin/collections/new"
                className="block w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Create New Collection
              </Link>
              <Link
                href="/admin/products/new"
                className="block w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Add New Product
              </Link>
              <Link
                href="/admin/inventory"
                className="block w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Update Inventory
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes to your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2 border-neutral-200 dark:border-neutral-700">
                <p className="text-sm font-medium">Collection Created</p>
                <p className="text-xs text-neutral-500">Summer 2024 collection was created</p>
                <p className="text-xs text-neutral-400">Just now</p>
              </div>
              <div className="border-b pb-2 border-neutral-200 dark:border-neutral-700">
                <p className="text-sm font-medium">Products Updated</p>
                <p className="text-xs text-neutral-500">6 products added to Essentials collection</p>
                <p className="text-xs text-neutral-400">Just now</p>
              </div>
              <div>
                <p className="text-sm font-medium">Inventory Updated</p>
                <p className="text-xs text-neutral-500">Product variants created with initial inventory</p>
                <p className="text-xs text-neutral-400">Just now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
