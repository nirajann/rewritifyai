import { NextResponse } from "next/server";
import type { RewriteErrorResponse } from "@/types/rewrite";

export function jsonError(message: string, status = 400) {
  const body: RewriteErrorResponse = {
    success: false,
    message,
  };

  return NextResponse.json(body, { status });
}