import Image from "next/image"
import Link from "next/link"
import { getCart } from "@/lib/cart"
import { CartItemActions } from "@/components/cart-item-actions"
import { CartEmpty } from "@/components/cart-empty"

export async function CartItems() {
  const cart = await getCart()

  if (cart.length === 0) {
    return <CartEmpty />
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {cart.map((item) => (
            <div key={item.id} className="py-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0">
                <Link href={`/products/${item.productId}`}>
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={item.imageUrl || "/placeholder.svg?height=100&width=100"}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </Link>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  {item.size && <p className="text-sm text-neutral-500 dark:text-neutral-400">Size: {item.size}</p>}
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end">
                  <CartItemActions item={item} />
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
