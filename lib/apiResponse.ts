import { NextResponse } from "next/server";
import { isRewriteQuotaError } from "@/lib/quotaService";
import type { RewriteErrorResponse, RewriteQuotaStatus } from "@/types/rewrite";

type JsonErrorOptions = {
  code?: "auth_required" | "quota_exceeded";
  quota?: RewriteQuotaStatus;
};

export function jsonError(message: string, status = 400, options?: JsonErrorOptions) {
  const body: RewriteErrorResponse = {
    success: false,
    message,
    code: options?.code,
    quota: options?.quota,
  };

  return NextResponse.json(body, { status });
}

export function jsonFromError(error: unknown, fallbackStatus = 500) {
  if (isRewriteQuotaError(error)) {
    return jsonError(error.message, error.status, {
      code: error.code,
      quota: error.quota,
    });
  }

  return jsonError(
    error instanceof Error ? error.message : "Server error",
    fallbackStatus,
  );
}
