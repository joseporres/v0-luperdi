// Supabase configuration
// Replace these values with your actual Supabase project details
export const supabaseConfig = {
  // Default to environment variables if available, otherwise use placeholders
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co",
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMzA5ODU0MCwiZXhwIjoxOTI4Njc0NTQwfQ.example",
}

// Validate configuration
export function isValidSupabaseConfig(): boolean {
  const { url, anonKey } = supabaseConfig

  // Check if URL is valid
  try {
    new URL(url)
  } catch (e) {
    console.error("Invalid Supabase URL:", url)
    return false
  }

  // Check if anon key is present and looks like a JWT
  if (!anonKey || !anonKey.includes(".") || anonKey.split(".").length !== 3) {
    console.error("Invalid Supabase anon key format")
    return false
  }

  return true
}
