"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const apiResponse_1 = require("@/lib/apiResponse");
const textTools_1 = require("@/lib/textTools");
const rewriteEngine_1 = require("@/lib/rewriteEngine");
const quotaService_1 = require("@/lib/quotaService");
const documentService_1 = require("@/lib/documentService");
const rewrite_1 = require("@/lib/validators/rewrite");
async function POST(req) {
    try {
        const body = await req.json();
        if ((body === null || body === void 0 ? void 0 : body.retry) === true) {
            const inputText = typeof body.inputText === "string" ? body.inputText.trim() : "";
            const currentOutputText = typeof body.currentOutputText === "string"
                ? body.currentOutputText.trim()
                : "";
            const tone = typeof body.tone === "string" ? body.tone.trim().toLowerCase() : "natural";
            const mode = typeof body.mode === "string" ? body.mode.trim().toLowerCase() : "standard";
            const userId = typeof body.userId === "string" && body.userId.trim()
                ? body.userId.trim()
                : null;
            if (!inputText || !currentOutputText) {
                return (0, apiResponse_1.jsonError)("Input text and current output are required.", 400);
            }
            const quota = await (0, quotaService_1.assertRewriteQuota)(userId);
            const outputText = (0, textTools_1.humanizeTextRetry)(inputText, currentOutputText, tone, mode);
            const finalWordCount = (0, textTools_1.countWords)(outputText);
            await (0, documentService_1.logUsage)({
                userId,
                tool: "humanize",
                wordCount: finalWordCount,
            });
            return server_1.NextResponse.json({
                success: true,
                tool: "humanize",
                outputText,
                tone,
                mode,
                wordCount: finalWordCount,
                quota: (0, quotaService_1.getPostRewriteQuota)(quota),
            });
        }
        const validated = (0, rewrite_1.validateRewriteRequest)(body);
        if (!validated.ok) {
            return (0, apiResponse_1.jsonError)(validated.message, 400);
        }
        const result = await (0, rewriteEngine_1.rewriteEngine)(Object.assign({ tool: "humanize" }, validated.data));
        return server_1.NextResponse.json(result);
    }
    catch (error) {
        return (0, apiResponse_1.jsonFromError)(error);
    }
}
