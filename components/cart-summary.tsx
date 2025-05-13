import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { getCartTotals } from "@/lib/cart"

interface CartSummaryProps {
  showCheckoutButton?: boolean
}

export async function CartSummary({ showCheckoutButton = true }: CartSummaryProps) {
  const { subtotal, shipping, total, itemCount } = await getCartTotals()

  if (itemCount === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4 border-neutral-200 dark:border-neutral-800">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        {showCheckoutButton && (
          <Button className="w-full mt-4" asChild>
            <Link href="/checkout">
              Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          <p>Secure checkout powered by Stripe</p>
        </div>
      </div>
    </div>
  )
}
