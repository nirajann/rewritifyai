"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PATCH = PATCH;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const apiResponse_1 = require("@/lib/apiResponse");
const documentService_1 = require("@/lib/documentService");
async function GET(_req, context) {
    try {
        const { id } = await context.params;
        const document = await (0, documentService_1.getDocumentById)(id);
        const versions = await (0, documentService_1.getDocumentVersions)(id);
        return server_1.NextResponse.json({
            success: true,
            document,
            versions,
        });
    }
    catch (error) {
        return (0, apiResponse_1.jsonError)(error instanceof Error ? error.message : "Server error", 500);
    }
}
async function PATCH(req, context) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        if (body.action === "restoreVersion") {
            const versionId = typeof body.versionId === "string" ? body.versionId.trim() : "";
            if (!versionId) {
                return (0, apiResponse_1.jsonError)("versionId is required", 400);
            }
            const restoredDocument = await (0, documentService_1.restoreVersionToDocument)(id, versionId);
            return server_1.NextResponse.json({
                success: true,
                document: restoredDocument,
            });
        }
        const title = typeof body.title === "string" && body.title.trim()
            ? body.title.trim()
            : "";
        if (!title) {
            return (0, apiResponse_1.jsonError)("title is required", 400);
        }
        const updated = await (0, documentService_1.renameDocument)(id, title);
        return server_1.NextResponse.json({
            success: true,
            document: updated,
        });
    }
    catch (error) {
        return (0, apiResponse_1.jsonError)(error instanceof Error ? error.message : "Server error", 500);
    }
}
async function DELETE(_req, context) {
    try {
        const { id } = await context.params;
        await (0, documentService_1.deleteDocument)(id);
        return server_1.NextResponse.json({
            success: true,
            message: "Document deleted successfully",
        });
    }
    catch (error) {
        return (0, apiResponse_1.jsonError)(error instanceof Error ? error.message : "Server error", 500);
    }
}
