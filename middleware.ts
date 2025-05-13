import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isValidSupabaseConfig } from "./lib/supabase/config"

export async function middleware(req: NextRequest) {
  // Simply pass through all requests without attempting to create a Supabase client
  // We'll check Supabase configuration but not try to create a client here
  if (!isValidSupabaseConfig()) {
    console.warn("Invalid Supabase configuration detected in middleware")
  }

  return NextResponse.next()
}
