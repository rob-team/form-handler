import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Root path: auto-detect browser language and redirect
  if (pathname === "/") {
    const acceptLanguage = request.headers.get("accept-language") || ""
    const locale = acceptLanguage.toLowerCase().startsWith("zh") ? "zh" : "en"
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    const response = NextResponse.redirect(url, 302)
    response.headers.set("x-locale", locale)
    return response
  }

  // Landing page locale paths: set x-locale header for root layout
  if (pathname === "/en" || pathname === "/zh") {
    const locale = pathname.replace("/", "")
    const response = NextResponse.next()
    response.headers.set("x-locale", locale)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/en", "/zh"],
}
