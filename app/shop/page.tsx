import { Suspense } from "react"
import { getProducts } from "@/app/actions/products"
import { getCurrentCollections, getCollectionBySlug } from "@/app/actions/collections"
import { ProductFilter } from "@/components/product-filter"
import { CollectionFilter } from "@/components/collection-filter"
import { ProductCard } from "@/components/product-card"
import { ProductSkeleton } from "@/components/product-skeleton"
import { SiteHeader, SiteFooter } from "@/app/layouts"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined
  const collectionSlug = typeof searchParams.collection === "string" ? searchParams.collection : undefined

  let collections = []
  let products = []
  let collectionName = ""
  let error = null

  try {
    // Get collections for the filter
    collections = await getCurrentCollections()

    // If collection is specified, get products from that collection
    if (collectionSlug) {
      const collection = await getCollectionBySlug(collectionSlug)
      if (collection) {
        products = collection.products
        collectionName = collection.name
      }
    } else {
      // Otherwise get all products
      products = await getProducts()
    }
  } catch (err) {
    console.error("Error fetching shop data:", err)
    error = err
  }

  // Filter products by category if provided
  const filteredProducts = category ? products.filter((product) => product.category === category) : products

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">{collectionName ? `${collectionName} Collection` : "Shop"}</h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                {collectionName
                  ? `Browse our ${collectionName} collection`
                  : "Browse our collection of premium Maison Luperdi apparel"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CollectionFilter collections={collections} />
              <ProductFilter />
            </div>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>Unable to load products at this time. Please try refreshing the page.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {!error ? (
              <Suspense fallback={Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p>No products found matching your criteria.</p>
                  </div>
                )}
              </Suspense>
            ) : (
              Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
