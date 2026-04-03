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
};

export type RewriteErrorResponse = {
  success: false;
  message: string;
};

export type RewriteResponse = RewriteSuccessResponse | RewriteErrorResponse;