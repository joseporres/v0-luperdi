import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getProducts } from "@/app/actions/products"
import { SiteHeader, SiteFooter } from "@/app/layouts"

export default async function Home() {
  let products = []
  let productsError = false
  let errorMessage = "Unable to load products at this time. Please try refreshing the page."

  try {
    console.log("Home page: Fetching products...")
    products = await getProducts()
    console.log(`Home page: Fetched ${products.length} products`)
  } catch (error) {
    console.error("Error in home page:", error)
    productsError = true
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block text-sm tracking-wider bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                  New Collection
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Refined Elegance. <br />
                  Exceptional Quality.
                </h1>
                <p className="max-w-[600px] text-neutral-500 dark:text-neutral-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Premium pima cotton essentials designed for sophistication and comfort. Timeless pieces for the modern
                  connoisseur.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="rounded-full" asChild>
                    <Link href="/shop">
                      Shop Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] aspect-square relative overflow-hidden rounded-xl">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Premium cotton apparel on model"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-50 dark:bg-neutral-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block text-sm tracking-wider bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                  Featured Products
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Signature Collection</h2>
                <p className="max-w-[700px] text-neutral-500 dark:text-neutral-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Timeless pieces crafted from premium pima cotton for everyday sophistication.
                </p>
              </div>
            </div>

            {productsError && (
              <Alert className="max-w-md mx-auto my-8">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {!productsError && products.length > 0 && (
              <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-8 py-12">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="group relative overflow-hidden rounded-lg">
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
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!productsError && products.length === 0 && (
              <div className="text-center py-12">
                <p>No products available at the moment. Check back soon!</p>
              </div>
            )}

            <div className="flex justify-center">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/shop">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Rest of the page remains unchanged */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <div className="inline-block text-sm tracking-wider bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                  Our Philosophy
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Elegance in simplicity.</h2>
                <p className="max-w-[600px] text-neutral-500 dark:text-neutral-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  At Maison Luperdi, we believe in the power of refined simplicity. Our garments are designed to be
                  timeless, versatile, and sustainable. We use only the finest pima cotton to ensure comfort and
                  longevity.
                </p>
                <ul className="grid gap-2 py-4">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                    <span>Premium pima cotton</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                    <span>Ethically manufactured</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                    <span>Timeless design</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                    <span>Refined comfort fit</span>
                  </li>
                </ul>
              </div>
              <div className="mx-auto w-full max-w-[500px] aspect-square relative overflow-hidden rounded-xl">
                <Image
                  src="/placeholder.svg?height=600&width=600"
                  alt="Elegant clothing display"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-900 dark:bg-neutral-800 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Join the Maison Luperdi Community</h2>
                <p className="max-w-[600px] text-neutral-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Subscribe to our newsletter for exclusive offers, new releases, and styling inspiration.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <input
                    className="flex h-10 w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-900 dark:focus:ring-neutral-300 dark:focus:ring-offset-neutral-800"
                    placeholder="Email address"
                    type="email"
                  />
                  <Button type="submit" className="rounded-md">
                    Subscribe
                  </Button>
                </form>
                <p className="text-xs text-neutral-400">By subscribing, you agree to our terms and privacy policy.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
