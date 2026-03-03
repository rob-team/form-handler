import { redirect } from "next/navigation"

// Middleware handles / → /en or /zh redirect based on Accept-Language.
// This fallback redirects to /en if middleware is bypassed.
export default function RootPage() {
  redirect("/en")
}
