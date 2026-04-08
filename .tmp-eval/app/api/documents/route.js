"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const apiResponse_1 = require("@/lib/apiResponse");
const documentService_1 = require("@/lib/documentService");
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return (0, apiResponse_1.jsonError)("userId is required", 400);
        }
        const documents = await (0, documentService_1.getDocumentsByUserId)(userId);
        return server_1.NextResponse.json({
            success: true,
            documents,
        });
    }
    catch (error) {
        return (0, apiResponse_1.jsonError)(error instanceof Error ? error.message : "Server error", 500);
    }
}
