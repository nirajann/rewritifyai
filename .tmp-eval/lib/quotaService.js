"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewriteQuotaError = void 0;
exports.getRewriteQuotaStatus = getRewriteQuotaStatus;
exports.assertRewriteQuota = assertRewriteQuota;
exports.getPostRewriteQuota = getPostRewriteQuota;
exports.isRewriteQuotaError = isRewriteQuotaError;
const supabase_js_1 = require("@supabase/supabase-js");
const REWRITE_TOOLS = [
    "humanize",
    "rewrite",
    "paraphrase",
    "improve",
    "expand",
    "shorten",
    "grammar",
];
const BETA_REWRITE_QUOTAS = {
    free: { limit: 25, period: "day" },
    pro: { limit: 100, period: "day" },
    plus: { limit: 250, period: "day" },
};
class RewriteQuotaError extends Error {
    constructor(message, status, code, quota) {
        super(message);
        this.name = "RewriteQuotaError";
        this.status = status;
        this.code = code;
        this.quota = quota;
    }
}
exports.RewriteQuotaError = RewriteQuotaError;
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url)
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey)
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    return (0, supabase_js_1.createClient)(url, serviceRoleKey);
}
function getUtcDayWindow() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
}
function normalizePlan(plan) {
    const normalized = (plan || "free").trim().toLowerCase();
    return normalized in BETA_REWRITE_QUOTAS ? normalized : "free";
}
async function getUserPlan(userId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();
    if (error) {
        throw new Error(`Failed to load profile for quota enforcement: ${error.message}`);
    }
    return normalizePlan(data === null || data === void 0 ? void 0 : data.plan);
}
async function countRewriteUsageSince(userId, startIso) {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("tool", [...REWRITE_TOOLS])
        .gte("created_at", startIso);
    if (error) {
        throw new Error(`Failed to load usage for quota enforcement: ${error.message}`);
    }
    return count || 0;
}
async function getRewriteQuotaStatus(userId) {
    const plan = await getUserPlan(userId);
    const quotaConfig = BETA_REWRITE_QUOTAS[plan] || BETA_REWRITE_QUOTAS.free;
    const { start, end } = getUtcDayWindow();
    const used = await countRewriteUsageSince(userId, start.toISOString());
    const remaining = Math.max(quotaConfig.limit - used, 0);
    return {
        plan,
        period: quotaConfig.period,
        limit: quotaConfig.limit,
        used,
        remaining,
        resetAt: end.toISOString(),
    };
}
async function assertRewriteQuota(userId) {
    if (!userId) {
        throw new RewriteQuotaError("Sign in to use rewrite tools during beta. Daily rewrite limits are tracked per account.", 401, "auth_required");
    }
    const quota = await getRewriteQuotaStatus(userId);
    if (quota.remaining <= 0) {
        throw new RewriteQuotaError(`Daily beta rewrite limit reached. You have used ${quota.used} of ${quota.limit} rewrites today. Access resets at ${quota.resetAt}.`, 429, "quota_exceeded", quota);
    }
    return quota;
}
function getPostRewriteQuota(quota) {
    return Object.assign(Object.assign({}, quota), { used: quota.used + 1, remaining: Math.max(quota.remaining - 1, 0) });
}
function isRewriteQuotaError(error) {
    return error instanceof RewriteQuotaError;
}
