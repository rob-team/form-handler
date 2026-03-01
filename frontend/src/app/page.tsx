import { redirect } from "next/navigation"

// Root path redirects to login; the dashboard auth guard handles authenticated users.
export default function RootPage() {
  redirect("/login")
}
