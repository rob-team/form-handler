import { getServerPocketBase } from "@/lib/pocketbase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LinkedProviders from "@/components/linked-providers"

export const metadata = { title: "Settings — FormHandler" }

export default async function SettingsPage() {
  const pb = await getServerPocketBase()
  let record = pb.authStore.record
  // Cookie may truncate fields — fetch fresh record for complete data
  if (record?.id) {
    try {
      record = await pb.collection("users").getOne(record.id)
    } catch {
      // Fall back to cookie record
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{record?.email}</span>
          </div>
          {record?.name && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span>{record.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkedProviders userId={record?.id ?? ""} />
        </CardContent>
      </Card>
    </div>
  )
}
