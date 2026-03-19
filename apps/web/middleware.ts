import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Language URL routing middleware.
 * Visiting /de/* or /en/* sets the language cookie and redirects to the actual path.
 * Example: /de/profile → sets lang=de cookie → redirects to /profile
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeMatch = pathname.match(/^\/(de|en)(\/.*)?$/);
  if (localeMatch) {
    const locale = localeMatch[1] as "de" | "en";
    const rest = localeMatch[2] ?? "/";

    const redirectUrl = new URL(rest, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set cookie so LanguageProvider picks it up on the client
    response.cookies.set("puqme.lang", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/de/:path*", "/en/:path*"],
};
