import Image from "next/image"
import Link from "next/link"

import { getProducts } from "@/app/actions/products"
import { SiteHeader, SiteFooter } from "@/app/layouts"

export default async function CollectionPage() {
  const products = await getProducts()

  // Get unique categories
  const categories = Array.from(new Set(products.map((product) => product.category)))

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Collections</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => {
              // Get first product of this category for the image
              const featuredProduct = products.find((product) => product.category === category)

              return (
                <div key={category} className="group relative overflow-hidden rounded-lg">
                  <Link href={`/shop?category=${category}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {category}</span>
                  </Link>
                  <div className="aspect-[3/2] w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={featuredProduct?.image_url || "/placeholder.svg?height=400&width=600"}
                      alt={category}
                      width={600}
                      height={400}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-white text-2xl font-bold capitalize">{category}</h2>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
