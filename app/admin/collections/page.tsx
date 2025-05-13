import Link from "next/link"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/database.types"

export default async function CollectionsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get all collections
  const { data: collections, error } = await supabase
    .from("collections")
    .select("*, products(count)")
    .order("is_permanent", { ascending: false })
    .order("release_date", { ascending: false })

  if (error) {
    console.error("Error fetching collections:", error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Button asChild>
          <Link href="/admin/collections/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Release Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">End Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections?.map((collection) => {
                const isActive = !collection.end_date || new Date(collection.end_date) > new Date()
                const productCount = collection.products?.length || 0

                return (
                  <tr key={collection.id} className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="px-4 py-3 text-sm">{collection.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {collection.is_permanent ? (
                        <Badge variant="default">Permanent</Badge>
                      ) : (
                        <Badge variant="secondary">Limited</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{productCount}</td>
                    <td className="px-4 py-3 text-sm">
                      {collection.release_date ? format(new Date(collection.release_date), "MMM d, yyyy") : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {collection.end_date
                        ? format(new Date(collection.end_date), "MMM d, yyyy")
                        : collection.is_permanent
                          ? "Never"
                          : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {collection.is_permanent ? (
                        <Badge variant="outline">Always Active</Badge>
                      ) : isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/collections/${collection.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {collections?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-500">
                    No collections found. Create your first collection to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
