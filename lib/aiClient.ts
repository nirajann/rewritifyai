import OpenAI from "openai";
import { humanizeText, paraphraseText, improveText } from "@/lib/textTools";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type RewriteParams = {
  tool:
    | "humanize"
    | "rewrite"
    | "paraphrase"
    | "improve"
    | "expand"
    | "shorten"
    | "grammar";
  inputText: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
  systemPrompt?: string;
  userInstruction?: string;
};

function runMock(
  tool: RewriteParams["tool"],
  inputText: string,
  mode = "standard"
) {
  if (tool === "humanize") return humanizeText(inputText);
  if (tool === "rewrite") return `Rewritten: ${inputText}`;
  if (tool === "paraphrase") return paraphraseText(inputText, mode);
  if (tool === "improve") return improveText(inputText);
  if (tool === "expand") return `${inputText} This adds a bit more explanation and detail to make the writing feel fuller.`;
  if (tool === "shorten") {
    const words = inputText.trim().split(/\s+/);
    return words.slice(0, Math.max(6, Math.floor(words.length * 0.6))).join(" ");
  }
  return improveText(inputText);
}

export async function processTextWithAI({
  tool,
  inputText,
  tone = "natural",
  mode = "standard",
  wordCount,
  systemPrompt,
  userInstruction,
}: RewriteParams) {
  if (!openai) {
    return runMock(tool, inputText, mode);
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
      return runMock(tool, inputText, mode);
    }

    return outputText;
  } catch {
    return runMock(tool, inputText, mode);
  }
}