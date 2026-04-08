"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonError = jsonError;
exports.jsonFromError = jsonFromError;
const server_1 = require("next/server");
const quotaService_1 = require("@/lib/quotaService");
function jsonError(message, status = 400, options) {
    const body = {
        success: false,
        message,
        code: options === null || options === void 0 ? void 0 : options.code,
        quota: options === null || options === void 0 ? void 0 : options.quota,
    };
    return server_1.NextResponse.json(body, { status });
}
function jsonFromError(error, fallbackStatus = 500) {
    if ((0, quotaService_1.isRewriteQuotaError)(error)) {
        return jsonError(error.message, error.status, {
            code: error.code,
            quota: error.quota,
        });
    }
    return jsonError(error instanceof Error ? error.message : "Server error", fallbackStatus);
}
