import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LayoutDashboard, ShoppingBag, FolderOpen, Package, Settings, Users, CreditCard } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import type { Database } from "@/lib/supabase/database.types"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // In a real app, you would check if the user has admin privileges
  // For now, we'll assume all authenticated users can access the admin area

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-900 text-white p-4 hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Maison Luperdi</h1>
          <p className="text-sm text-neutral-400">Admin Dashboard</p>
        </div>

        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800">
            <ShoppingBag className="h-5 w-5" />
            <span>Products</span>
          </Link>
          <Link href="/admin/collections" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800">
            <FolderOpen className="h-5 w-5" />
            <span>Collections</span>
          </Link>
          <Link href="/admin/inventory" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800">
            <Package className="h-5 w-5" />
            <span>Inventory</span>
          </Link>
          <Link
            href="/admin/transactions"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800"
          >
            <CreditCard className="h-5 w-5" />
            <span>Transactions</span>
          </Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800">
            <Users className="h-5 w-5" />
            <span>Customers</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">
            Return to Store
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user.email}</span>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
