import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { getCart, getCartTotals } from "@/lib/cart"
import { SiteHeader, SiteFooter } from "@/app/layouts"
import { CheckoutForm } from "@/components/checkout-form"
import { CartSummary } from "@/components/cart-summary"
import { validateCartStock } from "@/app/actions/transactions"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import type { Database } from "@/lib/supabase/database.types"

export default async function CheckoutPage() {
  // Initialize Supabase client
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Include the redirect parameter to return to checkout after login
    redirect("/login?redirect=/checkout")
  }

  // Get cart items - with improved error handling
  let cart = []
  let cartTotals = { total: 0, itemCount: 0, subtotal: 0, shipping: 0 }

  try {
    cart = await getCart()
    cartTotals = await getCartTotals()
  } catch (error) {
    console.error("Error fetching cart data:", error)
    // Instead of redirecting, we'll show an empty cart
    cart = []
    cartTotals = { total: 0, itemCount: 0, subtotal: 0, shipping: 0 }
  }

  // If cart is empty, redirect to cart page
  // This needs to be outside the try/catch to avoid catching the redirect
  if (cartTotals.itemCount === 0) {
    redirect("/cart")
  }

  // Validate stock levels for all cart items
  let stockValidation = { valid: true, items: [] }
  try {
    stockValidation = await validateCartStock()
  } catch (error) {
    console.error("Error validating stock:", error)
    // Continue with default values if there's an error
  }

  // Get user profile
  let profile = null
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (!profileError) {
      profile = profileData
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    // Continue without profile data if there's an error
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* Stock validation warnings */}
          {!stockValidation.valid && stockValidation.items && stockValidation.items.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Stock availability has changed</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Some items in your cart are no longer available in the requested quantity:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {stockValidation.items.map((item) => (
                    <li key={item.id}>
                      {item.name}: {item.reason}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">Please update your cart before proceeding.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutForm cart={cart} profile={profile} stockValid={stockValidation.valid} />
            </div>
            <div>
              <CartSummary showCheckoutButton={false} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
