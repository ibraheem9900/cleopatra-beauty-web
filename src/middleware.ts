import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "@/lib/config";

/**
 * Server-side protection for the admin panel.
 *
 * - /admin/* (except /admin/login) and /api/admin/* require an authenticated session.
 * - When Supabase is configured: verifies the Supabase auth session cookie.
 * - Otherwise: dev-mode cookie set by /api/admin/login.
 * - Unauthenticated requests are redirected (pages) or rejected with 401 (APIs).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  // /api/admin/login must stay public (it IS the dev-mode login endpoint);
  // everything else under /api/admin is admin-only.
  const isAdminApi =
    pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login");
  const isProtected = isAdminPage || isAdminApi;

  if (!isProtected) return NextResponse.next();

  let authenticated = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      });
      const { data } = await supabase.auth.getUser();
      authenticated = !!data.user;
    } catch {
      authenticated = false;
    }
  } else {
    authenticated = request.cookies.get("cleopatra_admin_dev")?.value === "1";
  }

  if (!authenticated) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};