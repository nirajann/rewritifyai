import { processTextWithAI } from "@/lib/aiClient";
import { preprocessText } from "@/lib/preprocess";
import {
  buildNotes,
  estimateHumanScore,
  postprocessText,
} from "@/lib/postprocess";
import {
  buildSystemPrompt,
  buildUserInstruction,
  ToolType,
} from "@/lib/promptBuilder";

export type RewriteTool = ToolType;

type RewriteParams = {
  tool: RewriteTool;
  inputText: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
};

export type RewriteResult = {
  success: boolean;
  tool: RewriteTool;
  outputText: string;
  tone: string;
  mode: string;
  wordCount: number;
  humanScore: number;
  notes: string[];
  message?: string;
};

export async function rewriteEngine({
  tool,
  inputText,
  tone = "natural",
  mode = "standard",
  wordCount,
}: RewriteParams): Promise<RewriteResult> {
  const prep = preprocessText(inputText);

  if (!prep.cleanedText) {
    throw new Error("inputText is required");
  }

  if (prep.tooShort) {
    throw new Error("Please enter a bit more text");
  }

  const systemPrompt = buildSystemPrompt();
  const userInstruction = buildUserInstruction({
    tool,
    tone,
    mode,
    wordCount: wordCount || prep.wordCount,
  });

  const rawOutput = await processTextWithAI({
    tool,
    inputText: prep.cleanedText,
    tone,
    mode,
    wordCount: wordCount || prep.wordCount,
    systemPrompt,
    userInstruction,
  });

  const outputText = postprocessText(rawOutput);
  const notes = buildNotes(tool, mode);
  const finalWordCount = outputText ? outputText.split(/\s+/).length : 0;
  const humanScore = estimateHumanScore(tool, outputText);

  return {
    success: true,
    tool,
    outputText,
    tone,
    mode,
    wordCount: finalWordCount,
    humanScore,
    notes,
  };
}