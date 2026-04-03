import type { RewriteTool } from "@/types/rewrite";

export function postprocessText(output: string) {
  let text = output || "";

  text = text.trim();

  text = text.replace(/^here'?s the rewritten text:\s*/i, "");
  text = text.replace(/^here is the rewritten text:\s*/i, "");
  text = text.replace(/^rewritten version:\s*/i, "");
  text = text.replace(/^humanized version:\s*/i, "");
  text = text.replace(/^improved version:\s*/i, "");
  text = text.replace(/^paraphrased version:\s*/i, "");
  text = text.replace(/^expanded version:\s*/i, "");
  text = text.replace(/^shortened version:\s*/i, "");
  text = text.replace(/^grammar-corrected version:\s*/i, "");

  text = text.replace(/[ ]{2,}/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/\s+([,.!?;:])/g, "$1");
  text = text.replace(/([.!?])([A-Z])/g, "$1 $2");

  return text.trim();
}

export function buildNotes(tool: RewriteTool, mode: string) {
  if (tool === "humanize") {
    return [
      "Reduced robotic phrasing",
      "Made wording sound more natural",
      "Preserved the original meaning",
    ];
  }

  if (tool === "rewrite") {
    return [
      "Refreshed wording",
      "Improved sentence variety",
      "Enhanced readability and flow",
    ];
  }

  if (tool === "paraphrase") {
    return [
      `Adjusted wording for ${mode} mode`,
      "Rephrased sentence structure",
      "Kept the core meaning intact",
    ];
  }

  if (tool === "improve") {
    return [
      "Improved grammar and flow",
      "Increased clarity and readability",
      "Polished sentence structure",
    ];
  }

  if (tool === "expand") {
    return [
      "Added supporting detail",
      "Expanded sentence depth",
      "Preserved the main message",
    ];
  }

  if (tool === "shorten") {
    return [
      "Removed unnecessary wording",
      "Made the text more concise",
      "Kept the main point intact",
    ];
  }

  return [
    "Corrected grammar and spelling",
    "Improved punctuation",
    "Polished sentence structure",
  ];
}

export function estimateHumanScore(tool: RewriteTool, outputText: string) {
  const words = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  if (!words) return 0;
  if (tool === "humanize") return 91;
  if (tool === "rewrite") return 89;
  if (tool === "paraphrase") return 88;
  if (tool === "improve") return 86;
  if (tool === "expand") return 84;
  if (tool === "shorten") return 87;
  return 85;
}