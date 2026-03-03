import PocketBase from "pocketbase"

let client: PocketBase | null = null

/**
 * Returns the PocketBase singleton for use in Client Components.
 *
 * - First call creates the instance and loads auth state from the browser cookie.
 * - Registers an onChange listener that keeps document.cookie in sync whenever
 *   the auth state changes (login, logout, token refresh).
 * - Guards against SSR by returning a throwaway instance when window is undefined.
 */
export function getPocketBase(): PocketBase {
  if (typeof window === "undefined") {
    // Called during SSR of a Client Component — return a short-lived instance.
    return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
  }

  if (!client) {
    client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL)
    client.authStore.loadFromCookie(document.cookie)

    client.authStore.onChange(() => {
      const isSecure = window.location.protocol === "https:"
      document.cookie = client!.authStore.exportToCookie({
        httpOnly: false,
        secure: isSecure,
        sameSite: "Lax",
      })
    })
  }

  return client
}
