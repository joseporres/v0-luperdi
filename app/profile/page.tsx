import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { SiteHeader, SiteFooter } from "@/app/layouts"
import { ProfileForm } from "@/components/profile/profile-form"
import type { Database } from "@/lib/supabase/database.types"

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Include the redirect parameter if it exists
    const redirectParam = searchParams?.redirect
      ? `?redirect=${encodeURIComponent(searchParams.redirect as string)}`
      : ""
    redirect(`/login${redirectParam}`)
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    // Handle missing profile
    return <div>Error loading profile</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <ProfileForm profile={profile} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
