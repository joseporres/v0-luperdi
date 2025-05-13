import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-6 mb-6">
        <ShoppingBag className="h-10 w-10 text-neutral-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md">
        Looks like you haven't added anything to your cart yet. Browse our collection to find your perfect Maison
        Luperdi essentials.
      </p>
      <Button asChild>
        <Link href="/shop">Continue Shopping</Link>
      </Button>
    </div>
  )
}
