"use client"

import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { getPocketBase } from "@/lib/pocketbase-browser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserAvatarMenuProps {
  user: {
    email: string
    name?: string
    avatarUrl?: string
  }
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return "?"
}

export default function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  function handleLogout() {
    const pb = getPocketBase()
    pb.authStore.clear()
    window.location.href = "/login"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />}
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
        {user.name && (
          <DropdownMenuLabel className="font-normal text-muted-foreground -mt-1.5">
            {user.email}
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
