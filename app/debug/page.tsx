import { SupabaseDebug } from "@/components/supabase-debug"

export default function DebugPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Supabase Debug Tools</h1>
      <SupabaseDebug />
    </div>
  )
}
