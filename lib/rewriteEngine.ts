import { RewriteRequest } from "@/lib/validators/rewrite";
import {
  buildProcessingNotes,
  countWords,
  estimateHumanScore,
  humanizeText,
  paraphraseText,
  prepareHumanizeInput,
} from "@/lib/textTools";
import {
  getDocumentVersions,
  logUsage,
  saveDocument,
  saveDocumentVersion,
} from "@/lib/documentService";

export type RewriteTool =
  | "humanize"
  | "rewrite"
  | "paraphrase"
  | "improve"
  | "expand"
  | "shorten"
  | "grammar";

type RewriteEngineParams = RewriteRequest & {
  tool: RewriteTool;
};

type RewriteSuccessResponse = {
  success: true;
  tool: RewriteTool;
  outputText: string;
  tone: string;
  mode: string;
  wordCount: number;
  humanScore: number;
  notes: string[];
  documentId?: string | null;
};

export async function rewriteEngine({
  tool,
  inputText,
  tone = "natural",
  mode = "standard",
  wordCount,
  title = "Untitled Document",
  documentId,
  userId,
  strength = "medium",
}: RewriteEngineParams): Promise<RewriteSuccessResponse> {
  let sourceInput = inputText;
  let outputText = inputText;

switch (tool) {
  case "humanize": {
    const prepared = prepareHumanizeInput(inputText);
    sourceInput = prepared.cleaned;
    outputText = humanizeText(prepared.cleaned, tone, mode, strength);
    break;
  }

  case "paraphrase": {
    outputText = paraphraseText(inputText, tone, mode, strength);
    break;
  }

  case "rewrite": {
    outputText = humanizeText(inputText, tone, mode, strength);
    break;
  }

  case "improve": {
    outputText = humanizeText(inputText, tone, mode, strength);
    break;
  }

  case "expand": {
    outputText =
      humanizeText(inputText, tone, mode, strength) +
      " This version adds a little more detail and clarity.";
    break;
  }

  case "shorten": {
    const parts = inputText.split(/(?<=[.!?])\s+/);
    outputText = parts
      .slice(0, Math.max(1, Math.ceil(parts.length * 0.7)))
      .join(" ");
    break;
  }

  case "grammar": {
    outputText = inputText
      .replace(/\bi\b/g, "I")
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bwont\b/gi, "won't");
    break;
  }
}
  

  const finalWordCount = countWords(outputText);
  const humanScore = estimateHumanScore(sourceInput, outputText, tool, strength);
  const notes = buildProcessingNotes(tool, tone, mode, strength);

  const savedDoc = await saveDocument({
    id: documentId || undefined,
    userId: userId || null,
    title,
    inputText: sourceInput,
    outputText,
    tool,
    tone,
    mode,
    wordCount: finalWordCount || wordCount || 0,
    humanScore,
  });

  const finalDocumentId: string | undefined = savedDoc?.id;

  if (finalDocumentId) {
    const existingVersions = await getDocumentVersions(finalDocumentId);
    const nextVersionNumber = (existingVersions?.length || 0) + 1;

    await saveDocumentVersion({
      documentId: finalDocumentId,
      versionNumber: nextVersionNumber,
      inputText: sourceInput,
      outputText,
      tool,
      tone,
      mode,
      wordCount: finalWordCount || wordCount || 0,
      humanScore,
    });

    await logUsage({
      userId: userId || null,
      tool,
      wordCount: finalWordCount || wordCount || 0,
    });
  }

  return {
    success: true,
    tool,
    outputText,
    tone,
    mode,
    wordCount: finalWordCount,
    humanScore,
    notes,
    documentId: finalDocumentId,
  };
}