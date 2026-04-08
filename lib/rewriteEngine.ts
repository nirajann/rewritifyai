import { RewriteRequest } from "@/lib/validators/rewrite";
import { processTextWithAI } from "@/lib/aiClient";
import {
  buildSystemPrompt,
  buildUserInstruction,
} from "@/lib/promptBuilder";
import {
  buildProcessingNotes,
  countWords,
  expandText,
  estimateHumanScore,
  grammarText,
  humanizeText,
  improveText,
  paraphraseText,
  prepareHumanizeInput,
  rewriteText,
  shortenText,
} from "@/lib/textTools";
import {
  getDocumentVersions,
  logUsage,
  saveDocument,
  saveDocumentVersion,
} from "@/lib/documentService";
import {
  assertRewriteQuota,
  getPostRewriteQuota,
} from "@/lib/quotaService";
import type { RewriteQuotaStatus } from "@/types/rewrite";

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
  quota?: RewriteQuotaStatus;
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
  const quota = await assertRewriteQuota(userId);
  let sourceInput = inputText;
  let outputText = inputText;

  if (tool === "humanize") {
    const prepared = prepareHumanizeInput(inputText);
    sourceInput = prepared.cleaned;
    outputText = humanizeText(sourceInput, tone, mode, strength);
  } else {
    outputText = await processTextWithAI({
      tool,
      inputText: sourceInput,
      tone,
      mode,
      wordCount,
      strength,
      systemPrompt: buildSystemPrompt(),
      userInstruction: buildUserInstruction({
        tool,
        tone,
        mode,
        wordCount,
        strength,
      }),
    });

    if (!outputText.trim()) {
      switch (tool) {
        case "paraphrase":
          outputText = paraphraseText(sourceInput, tone, mode, strength);
          break;
        case "rewrite":
          outputText = rewriteText(sourceInput, tone, mode, strength);
          break;
        case "improve":
          outputText = improveText(sourceInput, tone, mode, strength);
          break;
        case "expand":
          outputText = expandText(sourceInput, tone, mode, strength);
          break;
        case "shorten":
          outputText = shortenText(sourceInput, tone, mode, strength);
          break;
        case "grammar":
          outputText = grammarText(sourceInput);
          break;
        case "humanize":
          outputText = humanizeText(sourceInput, tone, mode, strength);
          break;
      }
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
  }

  await logUsage({
    userId: userId || null,
    tool,
    wordCount: finalWordCount || wordCount || 0,
  });

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
    quota: getPostRewriteQuota(quota),
  };
}
