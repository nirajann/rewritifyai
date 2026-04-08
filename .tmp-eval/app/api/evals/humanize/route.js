"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.POST = POST;
const server_1 = require("next/server");
const apiResponse_1 = require("@/lib/apiResponse");
const humanizeEval_1 = require("@/lib/evals/humanizeEval");
exports.dynamic = "force-dynamic";
function normalizeStrengths(value) {
    if (!Array.isArray(value)) {
        return ["light", "medium", "strong"];
    }
    const strengths = value.filter((item) => item === "light" || item === "medium" || item === "strong");
    return strengths.length > 0 ? strengths : ["light", "medium", "strong"];
}
async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const strengths = normalizeStrengths(body === null || body === void 0 ? void 0 : body.strengths);
        return server_1.NextResponse.json((0, humanizeEval_1.runHumanizeBenchmark)(strengths));
    }
    catch (error) {
        return (0, apiResponse_1.jsonFromError)(error);
    }
}
