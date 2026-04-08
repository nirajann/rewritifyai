export type RewriteTool =
  | "humanize"
  | "rewrite"
  | "paraphrase"
  | "improve"
  | "expand"
  | "shorten"
  | "grammar";

export type RewriteRequest = {
  inputText: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
  title?: string;
  documentId?: string;
  userId?: string | null;
  strength?: "light" | "medium" | "strong";
};

export type RewriteQuotaStatus = {
  plan: string;
  period: "day";
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
};

export type RewriteSuccessResponse = {
  success: true;
  tool: RewriteTool;
  outputText: string;
  tone: string;
  mode: string;
  wordCount: number;
  humanScore: number;
  notes: string[];
  documentId?: string;
  quota?: RewriteQuotaStatus;
};

export type RewriteErrorResponse = {
  success: false;
  message: string;
  code?: "auth_required" | "quota_exceeded";
  quota?: RewriteQuotaStatus;
};

export type RewriteResponse = RewriteSuccessResponse | RewriteErrorResponse;
