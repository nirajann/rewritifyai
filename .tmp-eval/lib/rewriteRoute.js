"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRewriteRoute = handleRewriteRoute;
const apiResponse_1 = require("@/lib/apiResponse");
const rewriteEngine_1 = require("@/lib/rewriteEngine");
const rewrite_1 = require("@/lib/validators/rewrite");
async function handleRewriteRoute(req, tool) {
    try {
        const body = await req.json();
        const validated = (0, rewrite_1.validateRewriteRequest)(body);
        if (!validated.ok) {
            return (0, apiResponse_1.jsonFromError)(new Error(validated.message), 400);
        }
        const result = await (0, rewriteEngine_1.rewriteEngine)(Object.assign({ tool }, validated.data));
        return Response.json(result);
    }
    catch (error) {
        return (0, apiResponse_1.jsonFromError)(error);
    }
}
