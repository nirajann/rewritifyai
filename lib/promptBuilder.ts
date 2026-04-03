import type { RewriteTool } from "@/types/rewrite";

type PromptArgs = {
  tool: RewriteTool;
  tone?: string;
  mode?: string;
  wordCount?: number;
  strength?: "light" | "medium" | "strong";
};

export function buildSystemPrompt() {
  return `
You are a premium AI writing assistant.
Your job is to rewrite text clearly, naturally, and professionally.

Rules:
- Return only the rewritten text
- Do not add headings, labels, or explanations
- Preserve the original meaning unless the instruction asks to expand or shorten
- Keep paragraph structure when possible
- Make the output polished and readable
`.trim();
}

function getStrengthInstruction(strength: "light" | "medium" | "strong" = "medium") {
  if (strength === "light") {
    return "Make light edits only. Preserve most of the original wording and structure.";
  }

  if (strength === "strong") {
    return "Rewrite aggressively with noticeably improved flow, phrasing, and sentence structure while preserving the meaning.";
  }

  return "Make moderate improvements to wording, sentence flow, and clarity while preserving the meaning.";
}

export function buildUserInstruction({
  tool,
  tone = "natural",
  mode = "standard",
  wordCount,
  strength = "medium",
}: PromptArgs) {
  const strengthInstruction = getStrengthInstruction(strength);

  let instruction = "";

  if (tool === "humanize") {
    instruction = `
Rewrite this text so it sounds clearly more human, natural, conversational, and less robotic.
Do not simply copy the original text.
Change wording and sentence flow where needed, but preserve the meaning.
${strengthInstruction}
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "rewrite") {
    instruction = `
Rewrite this text with fresher wording and better flow.
Preserve the meaning but noticeably improve expression and sentence variety.
${strengthInstruction}
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "paraphrase") {
    instruction = `
Paraphrase this text clearly while preserving the meaning.
${strengthInstruction}
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "improve") {
    instruction = `
Improve this text by fixing grammar, clarity, readability, and flow.
Keep the original meaning.
${strengthInstruction}
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "expand") {
    instruction = `
Expand this text with more detail, clarity, and completeness.
Preserve the meaning but make it more developed and informative.
${strengthInstruction}
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "shorten") {
    instruction = `
Shorten this text while preserving the core meaning.
Make it more concise, direct, and clean.
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "grammar") {
    instruction = `
Correct grammar, punctuation, spelling, and sentence structure.
Preserve the meaning and keep the text natural.
${strengthInstruction}
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  }

  if (wordCount && wordCount > 0 && tool !== "expand" && tool !== "shorten") {
    instruction += `\nTry to keep the output around ${wordCount} words.`;
  }

  return instruction;
}