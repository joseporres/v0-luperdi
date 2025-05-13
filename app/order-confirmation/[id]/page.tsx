import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"

import { SiteHeader, SiteFooter } from "@/app/layouts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase/database.types"

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get transaction details
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      products(*),
      product_variants(*, sizes(*))
    `,
    )
    .eq("id", params.id)
    .single()

  if (error || !transaction) {
    console.error("Error fetching transaction:", error)
    redirect("/account/orders")
  }

  // Check if the transaction belongs to the current user
  if (transaction.buyer_id !== session.user.id) {
    redirect("/account/orders")
  }

  // Format date
  const orderDate = new Date(transaction.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get estimated delivery date (7-10 days from order date)
  const estimatedDeliveryDate = new Date(transaction.created_at)
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7)
  const deliveryDateFormatted = estimatedDeliveryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been received and is being processed.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Order Number:</span>
                    <span className="font-mono">{transaction.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Order Date:</span>
                    <span>{orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Method:</span>
                    <span className="capitalize">{transaction.payment_method.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Order Status:</span>
                    <Badge variant={transaction.status === "pending" ? "outline" : "default"} className="capitalize">
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated Delivery:</span>
                    <span>{deliveryDateFormatted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                    <Image
                      src={transaction.products?.image_url || "/placeholder.svg?height=80&width=80"}
                      alt={transaction.products?.name || "Product"}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{transaction.products?.name}</h3>
                    {transaction.product_variants?.sizes && (
                      <p className="text-sm text-muted-foreground">Size: {transaction.product_variants.sizes.name}</p>
                    )}
                    <p className="text-sm">
                      ${transaction.price.toFixed(2)} x {transaction.quantity} = $
                      {(transaction.price * transaction.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Address:</span> {transaction.address}
                  </p>
                  <p>
                    <span className="font-medium">Province:</span> {transaction.province}
                  </p>
                  <p>
                    <span className="font-medium">Department:</span> {transaction.department}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild>
                <Link href="/account/orders">View All Orders</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
