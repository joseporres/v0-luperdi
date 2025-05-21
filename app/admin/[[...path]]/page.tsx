import { redirect } from "next/navigation"

export default function AdminCatchAll() {
  // Redirect any admin routes to the home page
  redirect("/")
}
