import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, message: "User was not created." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName || "",
      plan: "free",
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          message: `Account created but profile setup failed: ${profileError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: "Account created successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Signup failed.",
      },
      { status: 500 }
    );
  }
}