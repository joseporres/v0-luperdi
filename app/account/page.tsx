import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"

import { SiteHeader, SiteFooter } from "@/app/layouts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"
import { AddressForm } from "@/components/profile/address-form"
import { AccountSecurityForm } from "@/components/profile/account-security-form"
import type { Database } from "@/lib/supabase/database.types"

export default async function AccountPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/account")
  }

  // Get user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (error || !profile) {
    console.error("Error fetching profile:", error)
    return (
      <div className="container max-w-4xl py-10">
        <div className="bg-destructive/10 p-4 rounded-md">
          <p>Error loading profile. Please try again later.</p>
        </div>
      </div>
    )
  }

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("transactions")
    .select("id, created_at, status, price, quantity")
    .eq("buyer_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Account</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                    <CardDescription>
                      {profile.first_name} {profile.last_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Account Created</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/account/orders">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
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
                          My Orders
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/shop">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Continue Shopping
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {recentOrders && recentOrders.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <span className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className="text-sm capitalize">{order.status}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>${(order.price * order.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                        <Button asChild variant="link" className="w-full justify-center mt-2 p-0">
                          <Link href="/account/orders">View All Orders</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main content */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="profile">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                      </TabsList>
                      <TabsContent value="profile" className="pt-6">
                        <ProfileForm profile={profile} />
                      </TabsContent>
                      <TabsContent value="address" className="pt-6">
                        <AddressForm profile={profile} />
                      </TabsContent>
                      <TabsContent value="security" className="pt-6">
                        <AccountSecurityForm profile={profile} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
