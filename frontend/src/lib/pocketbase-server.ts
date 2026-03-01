import PocketBase from "pocketbase"
import { cookies } from "next/headers"

/**
 * Creates a new PocketBase instance for use in Server Components and Server Actions.
 *
 * IMPORTANT: This MUST be called as a factory (new instance per request).
 * Never export a module-level singleton — concurrent requests share Node.js memory
 * and a shared authStore would leak auth state between users.
 */
export async function getServerPocketBase(): Promise<PocketBase> {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)

  const cookieStore = await cookies()
  const authCookie = cookieStore.get("pb_auth")

  if (authCookie) {
    pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`)
  }

  return pb
}
