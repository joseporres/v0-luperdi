import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/app/actions/products"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const isLowInventory = product.inventory_count > 0 && product.inventory_count <= 5
  const isOutOfStock = product.inventory_count === 0

  return (
    <div className="group relative overflow-hidden rounded-lg">
      <Link href={`/products/${product.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">{product.name}</span>
      </Link>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={product.image_url || "/placeholder.svg?height=400&width=300"}
          alt={product.name}
          width={300}
          height={400}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        {isLowInventory && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">Low Stock</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">${product.price.toFixed(2)}</p>
      </div>
    </div>
  )
}
