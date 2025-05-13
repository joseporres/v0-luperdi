import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"

import { SiteHeader, SiteFooter } from "@/app/layouts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserTransactions } from "@/app/actions/transactions"
import type { Database } from "@/lib/supabase/database.types"

export default async function OrdersPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/account/orders")
  }

  // Get user transactions
  const transactions = await getUserTransactions()

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Orders</h1>
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>

            {transactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-neutral-100 p-3 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-neutral-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                  <p className="text-muted-foreground text-center mb-6">
                    You haven&apos;t placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Button asChild>
                    <Link href="/shop">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {transactions.map((transaction) => {
                  // Format date
                  const orderDate = new Date(transaction.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })

                  return (
                    <Card key={transaction.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Order #{transaction.id.slice(0, 8).toUpperCase()}</CardTitle>
                          <Badge
                            variant={transaction.status === "pending" ? "outline" : "default"}
                            className="capitalize"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Placed on {orderDate}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
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
                              <p className="text-sm text-muted-foreground">
                                Size: {transaction.product_variants.sizes.name}
                              </p>
                            )}
                            <p className="text-sm">
                              ${transaction.price.toFixed(2)} x {transaction.quantity} = $
                              {(transaction.price * transaction.quantity).toFixed(2)}
                            </p>
                          </div>
                          <Button asChild>
                            <Link href={`/account/orders/${transaction.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
