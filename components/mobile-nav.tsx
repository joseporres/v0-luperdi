"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="mb-4">
          <SheetTitle>Maison Luperdi</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4">
          <Link href="/shop" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/collections" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Collections
          </Link>
          <Link href="/about" className="text-lg font-medium" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/cart" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Cart
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
