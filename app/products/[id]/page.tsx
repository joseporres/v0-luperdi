import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart } from "lucide-react"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProductById } from "@/app/actions/products"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { SiteHeader, SiteFooter } from "@/app/layouts"
import { ProductVariantSelector } from "@/components/product-variant-selector"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const collection = product.collections
  const variants = product.variants || []
  const isOutOfStock = variants.every((variant) => variant.inventory_count === 0)

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link href="/shop" className="inline-flex items-center text-sm font-medium mb-6 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shop
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={product.image_url || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {collection && (
                <div className="absolute top-4 left-4">
                  <Badge variant={collection.is_permanent ? "default" : "secondary"}>
                    {collection.name} Collection
                  </Badge>
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="mt-2 text-2xl font-semibold">${product.price.toFixed(2)}</div>

              <div className="mt-6">
                <h2 className="text-lg font-medium mb-2">Description</h2>
                <p className="text-neutral-600 dark:text-neutral-400">{product.description}</p>
              </div>

              {variants.length > 0 && (
                <div className="mt-6">
                  <ProductVariantSelector variants={variants} />
                </div>
              )}

              <div className="mt-8 space-y-4">
                <AddToCartButton productId={product.id} disabled={isOutOfStock} />
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
              </div>

              <div className="mt-8 border-t pt-6 border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-medium mb-2">Details</h2>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li>100% premium pima cotton</li>
                  <li>Refined fit</li>
                  <li>Machine washable</li>
                  <li>Ethically manufactured</li>
                  {product.sku && <li>SKU: {product.sku}</li>}
                  {collection && <li>Collection: {collection.name}</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
