"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = PATCH;
const server_1 = require("next/server");
const supabase_js_1 = require("@supabase/supabase-js");
async function PATCH(req) {
    try {
        const body = await req.json();
        const userId = typeof body.userId === "string" ? body.userId.trim() : "";
        const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
        if (!userId) {
            return server_1.NextResponse.json({ success: false, message: "userId is required." }, { status: 400 });
        }
        if (!fullName) {
            return server_1.NextResponse.json({ success: false, message: "fullName is required." }, { status: 400 });
        }
        const supabaseAdmin = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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
            return server_1.NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
        return server_1.NextResponse.json({
            success: true,
            profile: data,
            message: "Profile updated successfully.",
        });
    }
    catch (error) {
        return server_1.NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to update profile.",
        }, { status: 500 });
    }
}
