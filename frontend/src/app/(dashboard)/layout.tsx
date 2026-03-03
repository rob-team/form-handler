import { redirect } from "next/navigation"
import { getServerPocketBase } from "@/lib/pocketbase-server"
import UserAvatarMenu from "@/components/user-avatar-menu"
import Logo from "@/components/logo"

export const metadata = { title: "Dashboard — FormHandler" }

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pb = await getServerPocketBase()

  if (!pb.authStore.isValid) {
    redirect("/login?redirect=%2Fdashboard")
  }

  // Cookie may truncate fields (4KB limit) — fetch fresh record for avatar/name
  let record = pb.authStore.record
  if (record?.id) {
    try {
      record = await pb.collection("users").getOne(record.id)
    } catch {
      // Fall back to cookie record if fetch fails
    }
  }
  const avatarUrl = record?.avatar
    ? pb.files.getURL(record, record.avatar)
    : undefined

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo />
          <UserAvatarMenu
            user={{
              email: record?.email ?? "",
              name: record?.name || undefined,
              avatarUrl,
            }}
          />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
