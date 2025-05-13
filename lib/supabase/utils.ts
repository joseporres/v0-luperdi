import { getActionSupabaseClient } from "./server"

export async function ensureProfileExists(userId: string, email: string) {
  try {
    const supabase = getActionSupabaseClient()

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error ensuring profile exists:", error)
    return false
  }
}
