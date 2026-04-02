export type ToolType =
  | "humanize"
  | "rewrite"
  | "paraphrase"
  | "improve"
  | "expand"
  | "shorten"
  | "grammar";

type PromptArgs = {
  tool: ToolType;
  tone?: string;
  mode?: string;
  wordCount?: number;
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

export function buildUserInstruction({
  tool,
  tone = "natural",
  mode = "standard",
  wordCount,
}: PromptArgs) {
  let instruction = "";

  if (tool === "humanize") {
    instruction = `
Rewrite this text so it sounds clearly more human, natural, conversational, and less robotic.
Do not simply copy the original text.
Change wording and sentence flow where needed, but preserve the meaning.
Tone: ${tone}.
`.trim();
  } else if (tool === "rewrite") {
    instruction = `
Rewrite this text with fresher wording and better flow.
Preserve the meaning but noticeably improve expression and sentence variety.
Tone: ${tone}.
Mode: ${mode}.
`.trim();
  } else if (tool === "paraphrase") {
    instruction = `
Paraphrase this text clearly while preserving the meaning.
Use mode: ${mode}.
Tone: ${tone}.
`.trim();
  } else if (tool === "improve") {
    instruction = `
Improve this text by fixing grammar, clarity, readability, and flow.
Keep the original meaning.
Tone: ${tone}.
`.trim();
  } else if (tool === "expand") {
    instruction = `
Expand this text with more detail, clarity, and completeness.
Preserve the meaning but make it more developed and informative.
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
Tone: ${tone}.
`.trim();
  }

  if (wordCount && wordCount > 0 && tool !== "expand" && tool !== "shorten") {
    instruction += `\nTry to keep the output around ${wordCount} words.`;
  }

  return instruction;
}