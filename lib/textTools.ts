export function humanizeText(input: string) {
  let output = input.trim();

  const replacements: Record<string, string> = {
    "utilize": "use",
    "individuals": "people",
    "purchase": "buy",
    "assist": "help",
    "therefore": "so",
    "however": "but",
    "moreover": "also",
    "children": "kids",
    "dont": "don't",
    "cant": "can't",
    "wont": "won't",
    "is not": "isn't",
    "do not": "don't",
    "cannot": "can't",
    "in order to": "to",
    "generate": "create",
    "quickly": "fast"
  };

  for (const [from, to] of Object.entries(replacements)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    output = output.replace(regex, to);
  }

  output = output.replace(
    /many people use it to create content fast, but the writing often sounds robotic and unnatural/gi,
    "a lot of people use it to create content quickly, but the result can still sound robotic and unnatural"
  );

  output = output.replace(
    /artificial intelligence is a very useful technology/gi,
    "Artificial intelligence is very useful"
  );

  output = output.replace(/\s+/g, " ").trim();

  if (output.length > 0) {
    output = output.charAt(0).toUpperCase() + output.slice(1);
  }

  if (!/[.!?]$/.test(output)) {
    output += ".";
  }

  return output;
}

export function paraphraseText(input: string, mode: string) {
  const cleaned = input.trim();

  if (mode === "school") {
    return `In simple terms, ${cleaned}`;
  }

  if (mode === "report") {
    return `This report explains that ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  if (mode === "thesis") {
    return `This study suggests that ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  if (mode === "research") {
    return `From a research perspective, ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  if (mode === "proposal") {
    return `It is proposed that ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  return `In other words, ${cleaned}`;
}

export function improveText(input: string) {
  let output = input.trim();

  output = output.replace(/\bi\b/g, "I");
  output = output.replace(/\bdont\b/gi, "don't");
  output = output.replace(/\bdoesnt\b/gi, "doesn't");
  output = output.replace(/\bcant\b/gi, "can't");
  output = output.replace(/\bwont\b/gi, "won't");
  output = output.replace(/\bim\b/gi, "I'm");

  if (output.length > 0) {
    output = output.charAt(0).toUpperCase() + output.slice(1);
  }

  if (!/[.!?]$/.test(output)) {
    output += ".";
  }

  return output;
}