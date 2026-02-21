import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = await createClient();

  // Sign out from Supabase (clears session)
  await supabase.auth.signOut();

  // Get the cookie store to clear auth cookies
  const cookieStore = await cookies();

  // Clear all Supabase auth cookies
  const allCookies = cookieStore.getAll();
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    { status: 302 }
  );

  // Delete auth-related cookies
  allCookies.forEach((cookie) => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.delete(cookie.name);
    }
  });

  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');

  return response;
}
