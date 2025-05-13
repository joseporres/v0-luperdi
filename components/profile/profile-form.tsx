"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url?: string
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        throw error
      }

      setSuccess("Profile updated successfully")

      // If there's a redirect URL, navigate there after a short delay
      if (redirectUrl) {
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1000) // Short delay to show success message
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {redirectUrl ? "Please complete your profile to continue" : "Update your personal information"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>
            {success}
            {redirectUrl && " Redirecting you to continue..."}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          {redirectUrl && (
            <Button type="button" variant="outline" onClick={() => router.push(redirectUrl)}>
              Skip & Continue
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
