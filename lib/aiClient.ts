import OpenAI from "openai";

import type { RewriteTool } from "@/types/rewrite";
import {
  buildHumanizeSystemPrompt,
  buildHumanizeTaskPrompt,
  buildSystemPrompt,
  buildUserInstruction,
} from "@/lib/promptBuilder";
import {
  expandText,
  grammarText,
  humanizeText,
  improveText,
  paraphraseText,
  rewriteText,
  shortenText,
} from "@/lib/textTools";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type ProcessTextParams = {
  tool: RewriteTool;
  inputText: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
  strength?: "light" | "medium" | "strong";
  systemPrompt?: string;
  userInstruction?: string;
};

function runMock(
  tool: RewriteTool,
  inputText: string,
  tone = "natural",
  mode = "standard",
  strength: "light" | "medium" | "strong" = "medium",
) {
  if (tool === "humanize") return humanizeText(inputText, tone, mode, strength);
  if (tool === "rewrite") return rewriteText(inputText, tone, mode, strength);
  if (tool === "paraphrase") return paraphraseText(inputText, tone, mode, strength);
  if (tool === "improve") return improveText(inputText, tone, mode, strength);
  if (tool === "expand") return expandText(inputText, tone, mode, strength);
  if (tool === "shorten") return shortenText(inputText, tone, mode, strength);
  return grammarText(inputText);
}

export async function processTextWithAI({
  tool,
  inputText,
  tone = "natural",
  mode = "standard",
  wordCount,
  strength = "medium",
  systemPrompt,
  userInstruction,
}: ProcessTextParams) {
  if (!openai) {
    return runMock(tool, inputText, tone, mode, strength);
  }

  const finalSystemPrompt =
    systemPrompt ||
    (tool === "humanize" ? buildHumanizeSystemPrompt() : buildSystemPrompt());

  let finalUserInstruction =
    userInstruction ||
    (tool === "humanize"
      ? buildHumanizeTaskPrompt({
          tone,
          mode,
          wordCount,
          strength,
        })
      : buildUserInstruction({
          tool,
          tone,
          mode,
          wordCount,
          strength,
        }));

  if (wordCount && wordCount > 0 && !finalUserInstruction.includes("around")) {
    finalUserInstruction += ` Try to keep the output around ${wordCount} words.`;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: finalSystemPrompt,
        },
        {
          role: "user",
          content: `${finalUserInstruction}\n\n<SOURCE_TEXT>\n${inputText}\n</SOURCE_TEXT>`,
        },
      ],
    });

    const outputText = response.output_text?.trim();

    if (!outputText) {
      return runMock(tool, inputText, tone, mode, strength);
    }

    return outputText;
  } catch {
    return runMock(tool, inputText, tone, mode, strength);
  }
}
