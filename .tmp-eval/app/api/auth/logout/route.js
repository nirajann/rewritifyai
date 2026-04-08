"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
async function POST() {
    return server_1.NextResponse.json({
        success: true,
        message: "Logged out successfully.",
    });
}
