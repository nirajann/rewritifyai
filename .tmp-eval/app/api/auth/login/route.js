"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const supabase_js_1 = require("@supabase/supabase-js");
async function POST(req) {
    try {
        const body = await req.json();
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password.trim() : "";
        if (!email || !password) {
            return server_1.NextResponse.json({ success: false, message: "Please enter your email and password." }, { status: 400 });
        }
        const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return server_1.NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
        return server_1.NextResponse.json({
            success: true,
            user: data.user,
            session: data.session,
            message: "Login successful.",
        });
    }
    catch (error) {
        return server_1.NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Login failed.",
        }, { status: 500 });
    }
}
