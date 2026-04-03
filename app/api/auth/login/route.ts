import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: "Login successful.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Login failed.",
      },
      { status: 500 }
    );
  }
}