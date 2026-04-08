"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const supabase_js_1 = require("@supabase/supabase-js");
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return server_1.NextResponse.json({ success: false, message: "userId is required." }, { status: 400 });
        }
        const supabaseAdmin = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        if (error) {
            return server_1.NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
        return server_1.NextResponse.json({
            success: true,
            profile: data,
        });
    }
    catch (error) {
        return server_1.NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Failed to fetch profile.",
        }, { status: 500 });
    }
}
