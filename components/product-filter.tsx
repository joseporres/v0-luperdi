"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProductFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

  const categories = [
    { value: "tees", label: "T-Shirts" },
    { value: "hoodies", label: "Hoodies" },
    { value: "sweatshirts", label: "Sweatshirts" },
  ]

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category) {
      params.set("category", category)
    } else {
      params.delete("category")
    }

    router.push(`/shop?${params.toString()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {currentCategory && <span className="ml-1 text-xs">({currentCategory})</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={!currentCategory} onCheckedChange={() => handleCategoryChange(null)}>
          All Products
        </DropdownMenuCheckboxItem>
        {categories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category.value}
            checked={currentCategory === category.value}
            onCheckedChange={(checked) => {
              if (checked) handleCategoryChange(category.value)
            }}
          >
            {category.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
