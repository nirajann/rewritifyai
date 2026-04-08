import { NextResponse } from "next/server";
import { jsonError, jsonFromError } from "@/lib/apiResponse";
import { countWords, humanizeTextRetry } from "@/lib/textTools";
import { rewriteEngine } from "@/lib/rewriteEngine";
import { assertRewriteQuota, getPostRewriteQuota } from "@/lib/quotaService";
import { logUsage } from "@/lib/documentService";
import { validateRewriteRequest } from "@/lib/validators/rewrite";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body?.retry === true) {
      const inputText =
        typeof body.inputText === "string" ? body.inputText.trim() : "";
      const currentOutputText =
        typeof body.currentOutputText === "string"
          ? body.currentOutputText.trim()
          : "";
      const tone =
        typeof body.tone === "string" ? body.tone.trim().toLowerCase() : "natural";
      const mode =
        typeof body.mode === "string" ? body.mode.trim().toLowerCase() : "standard";
      const userId =
        typeof body.userId === "string" && body.userId.trim()
          ? body.userId.trim()
          : null;

      if (!inputText || !currentOutputText) {
        return jsonError("Input text and current output are required.", 400);
      }

      const quota = await assertRewriteQuota(userId);
      const outputText = humanizeTextRetry(inputText, currentOutputText, tone, mode);
      const finalWordCount = countWords(outputText);

      await logUsage({
        userId,
        tool: "humanize",
        wordCount: finalWordCount,
      });

      return NextResponse.json({
        success: true,
        tool: "humanize",
        outputText,
        tone,
        mode,
        wordCount: finalWordCount,
        quota: getPostRewriteQuota(quota),
      });
    }

    const validated = validateRewriteRequest(body);

    if (!validated.ok) {
      return jsonError(validated.message, 400);
    }

    const result = await rewriteEngine({
      tool: "humanize",
      ...validated.data,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonFromError(error);
  }
}
