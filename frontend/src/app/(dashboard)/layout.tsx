import { redirect } from "next/navigation"
import { getServerPocketBase } from "@/lib/pocketbase-server"
import LogoutButton from "@/components/logout-button"

export const metadata = { title: "Dashboard — FormSaaS" }

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pb = await getServerPocketBase()

  if (!pb.authStore.isValid) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/dashboard" className="font-semibold text-lg">
            FormSaaS
          </a>
          <LogoutButton />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
