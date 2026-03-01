"use client"

import { useRouter } from "next/navigation"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const router = useRouter()

  function handleLogout() {
    const pb = getPocketBase()
    pb.authStore.clear() // triggers onChange → clears document.cookie
    router.push("/login")
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Log out
    </Button>
  )
}
