import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const userId =
      typeof body.userId === "string" ? body.userId.trim() : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "fullName is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update profile.",
      },
      { status: 500 }
    );
  }
}