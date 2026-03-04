import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Google returned an error
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}&desc=${errorDescription}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (!sessionError) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    // Redirect with the actual error message
    return NextResponse.redirect(`${origin}/login?error=${sessionError.message}`);
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}