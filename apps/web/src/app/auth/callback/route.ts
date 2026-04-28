import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const plan = searchParams.get("plan") ?? "free";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Après auth, rediriger vers checkout si plan payant
  if (plan !== "free") {
    return NextResponse.redirect(`${origin}/dashboard?upgrade=${plan}`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
