export type RewriteRequest = {
  inputText: string;
  tone: string;
  mode: string;
  wordCount?: number;
  title?: string;
  documentId?: string | null;
  userId?: string | null;
  strength?: "light" | "medium" | "strong";
};

export function validateRewriteRequest(body: unknown):
  | { ok: true; data: RewriteRequest }
  | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid request body." };
  }

  const payload = body as Record<string, unknown>;

  const inputText =
    typeof payload.inputText === "string" ? payload.inputText.trim() : "";
  const tone =
    typeof payload.tone === "string" ? payload.tone.trim().toLowerCase() : "natural";
  const mode =
    typeof payload.mode === "string" ? payload.mode.trim().toLowerCase() : "standard";
  const title =
    typeof payload.title === "string" ? payload.title.trim() : "Untitled Document";
  const documentId =
    typeof payload.documentId === "string" && payload.documentId.trim()
      ? payload.documentId.trim()
      : null;
  const userId =
    typeof payload.userId === "string" && payload.userId.trim()
      ? payload.userId.trim()
      : null;
  const wordCount =
    typeof payload.wordCount === "number" ? payload.wordCount : undefined;

  const strength =
    payload.strength === "light" ||
    payload.strength === "medium" ||
    payload.strength === "strong"
      ? payload.strength
      : "medium";

  if (!inputText) {
    return { ok: false, message: "Input text is required." };
  }

  if (inputText.length < 10) {
    return { ok: false, message: "Please enter a bit more text." };
  }

  return {
    ok: true,
    data: {
      inputText,
      tone,
      mode,
      title,
      documentId,
      userId,
      wordCount,
      strength,
    },
  };
}