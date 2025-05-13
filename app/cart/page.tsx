import { Suspense } from "react"
import { CartItems } from "@/components/cart-items"
import { CartSummary } from "@/components/cart-summary"
import { SiteHeader, SiteFooter } from "@/app/layouts"

export default function CartPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Suspense fallback={<div>Loading cart items...</div>}>
                <CartItems />
              </Suspense>
            </div>
            <div>
              <CartSummary />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
