"use client"

import { getPocketBase } from "@/lib/pocketbase-browser"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  function handleLogout() {
    const pb = getPocketBase()
    pb.authStore.clear() // triggers onChange → clears document.cookie
    window.location.href = "/login"
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Log out
    </Button>
  )
}
