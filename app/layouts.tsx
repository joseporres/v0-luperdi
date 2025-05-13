import Link from "next/link"
import { Instagram, Twitter } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { AccountMenu } from "@/components/account-menu"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-background">
      <div className="container px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold tracking-wider">Maison Luperdi</span>
        </Link>
        <MainNav />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AccountMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-background">
      <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full items-center px-4 md:px-6">
        <p className="text-xs text-neutral-500">© 2024 Maison Luperdi. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/about" className="text-xs hover:underline underline-offset-4">
            About
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <Instagram className="h-4 w-4" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <Twitter className="h-4 w-4" />
            <span className="sr-only">Twitter</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
