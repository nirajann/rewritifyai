import OpenAI from "openai";

import type { RewriteTool } from "@/types/rewrite";
import { humanizeText, paraphraseText } from "@/lib/textTools";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type ProcessTextParams = {
  tool: RewriteTool;
  inputText: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
  systemPrompt?: string;
  userInstruction?: string;
};

function rewriteText(inputText: string) {
  return humanizeText(inputText, "natural", "standard", "medium");
}

function improveText(inputText: string) {
  return humanizeText(inputText, "natural", "standard", "light");
}

function expandText(inputText: string) {
  return (
    humanizeText(inputText, "natural", "standard", "medium") +
    " This version adds a little more explanation and detail."
  );
}

function shortenText(inputText: string) {
  const parts = inputText.split(/(?<=[.!?])\s+/);
  return parts.slice(0, Math.max(1, Math.ceil(parts.length * 0.7))).join(" ");
}

function grammarFixText(inputText: string) {
  return inputText
    .replace(/\bi\b/g, "I")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bwont\b/gi, "won't");
}

function runMock(
  tool: RewriteTool,
  inputText: string,
  tone = "natural",
  mode = "standard",
) {
  if (tool === "humanize") return humanizeText(inputText, tone, mode, "medium");
  if (tool === "rewrite") return rewriteText(inputText);
  if (tool === "paraphrase") return paraphraseText(inputText, tone, mode, "medium");
  if (tool === "improve") return improveText(inputText);
  if (tool === "expand") return expandText(inputText);
  if (tool === "shorten") return shortenText(inputText);
  return grammarFixText(inputText);
}

export async function processTextWithAI({
  tool,
  inputText,
  tone = "natural",
  mode = "standard",
  wordCount,
  systemPrompt,
  userInstruction,
}: ProcessTextParams) {
  if (!openai) {
    return runMock(tool, inputText, tone, mode);
  }

  const fallbackInstruction =
    tool === "humanize"
      ? "Rewrite the text so it sounds more natural and human while preserving meaning."
      : tool === "rewrite"
      ? "Rewrite the text with fresher wording and better flow while preserving meaning."
      : tool === "paraphrase"
      ? `Paraphrase the text clearly. Mode: ${mode}. Tone: ${tone}.`
      : tool === "improve"
      ? "Improve the writing by fixing grammar, clarity, and flow."
      : tool === "expand"
      ? "Expand the text with more detail while preserving the meaning."
      : tool === "shorten"
      ? "Shorten the text while preserving the core meaning."
      : "Correct grammar, punctuation, and spelling while preserving meaning.";

  const finalSystemPrompt =
    systemPrompt ||
    "You are a professional writing assistant. Return only the rewritten text.";

  let finalUserInstruction = userInstruction || fallbackInstruction;

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
          content: `${finalUserInstruction}\n\nText:\n${inputText}`,
        },
      ],
    });

    const outputText = response.output_text?.trim();

    if (!outputText) {
      return runMock(tool, inputText, tone, mode);
    }

    return outputText;
  } catch {
    return runMock(tool, inputText, tone, mode);
  }
}