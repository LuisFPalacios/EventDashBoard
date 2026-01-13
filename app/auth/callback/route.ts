import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_REDIRECTS = [
  "/",
  "/dashboard",
  "/dashboard/events",
  "/profile",
];

function isValidRedirect(path: string): boolean {
  if (!path || !path.startsWith("/")) {
    return false;
  }

  // Prevent protocol-relative URLs (//evil.com)
  if (path.startsWith("//")) {
    return false;
  }

  // Check if path starts with any allowed redirect
  return ALLOWED_REDIRECTS.some(allowed =>
    path === allowed || path.startsWith(allowed + "/")
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate redirect URL
  const redirectPath = isValidRedirect(next) ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=authentication_failed`);
}
