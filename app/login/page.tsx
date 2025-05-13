import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { SiteHeader, SiteFooter } from "@/app/layouts"
import { LoginForm } from "@/components/auth/login-form"
import type { Database } from "@/lib/supabase/database.types"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is already authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is already logged in and there's a redirect, go there
  if (session) {
    if (searchParams?.redirect) {
      redirect(searchParams.redirect as string)
    } else {
      redirect("/")
    }
  }

  // Get the redirect URL from query parameters
  const redirectUrl = searchParams?.redirect ? (searchParams.redirect as string) : undefined

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <LoginForm redirectUrl={redirectUrl} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
