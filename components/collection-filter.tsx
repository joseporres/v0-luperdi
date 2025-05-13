"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ShoppingBasketIcon as Collection } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Collection as CollectionType } from "@/app/actions/collections"

interface CollectionFilterProps {
  collections: CollectionType[]
}

export function CollectionFilter({ collections }: CollectionFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCollection = searchParams.get("collection")

  const handleCollectionChange = (collection: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (collection) {
      params.set("collection", collection)
      // Remove category filter when changing collection
      params.delete("category")
    } else {
      params.delete("collection")
    }

    router.push(`/shop?${params.toString()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Collection className="h-4 w-4" />
          Collection
          {currentCollection && (
            <span className="ml-1 text-xs">
              ({collections.find((c) => c.slug === currentCollection)?.name || currentCollection})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by Collection</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={!currentCollection} onCheckedChange={() => handleCollectionChange(null)}>
          All Collections
        </DropdownMenuCheckboxItem>
        {collections.map((collection) => (
          <DropdownMenuCheckboxItem
            key={collection.id}
            checked={currentCollection === collection.slug}
            onCheckedChange={(checked) => {
              if (checked) handleCollectionChange(collection.slug)
            }}
          >
            {collection.name}
            {collection.is_permanent && <span className="ml-2 text-xs">(Permanent)</span>}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
