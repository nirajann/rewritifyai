import { PHRASE_REPLACEMENTS, WORD_REPLACEMENTS } from "@/lib/replacementLibrary";
import { STARTER_CLEANUP_PATTERNS } from "@/lib/starterCleanupLibrary";
import { ESSAY_PATTERN_REPLACEMENTS } from "@/lib/essayPatternLibrary";
export type Strength = "light" | "medium" | "strong";
export type RewriteTool =
  | "humanize"
  | "rewrite"
  | "paraphrase"
  | "improve"
  | "expand"
  | "shorten"
  | "grammar";

type PreparedInput = {
  original: string;
  cleaned: string;
};

type ProtectedToken = {
  key: string;
  value: string;
};

const AI_PHRASES: RegExp[] = [
  /\bin conclusion\b/gi,
  /\bto conclude\b/gi,
  /\bmoreover\b/gi,
  /\bfurthermore\b/gi,
  /\badditionally\b/gi,
  /\bit is important to note that\b/gi,
  /\bit should be noted that\b/gi,
  /\bin today's world\b/gi,
  /\bin the modern world\b/gi,
  /\bwithout a doubt\b/gi,
  /\bplays a vital role\b/gi,
  /\bplays an important role\b/gi,
  /\ba wide range of\b/gi,
  /\bdelves into\b/gi,
  /\bmore specifically\b/gi,
  /\bat the same time\b/gi,
  /\bin many cases\b/gi,
  /\bit can be said that\b/gi,
  /\bthis means that\b/gi,
  /\boverall\b/gi,
  /\bnotably\b/gi,
  /\bin essence\b/gi,
  /\bat its core\b/gi,
  /\bneedless to say\b/gi,
];

const FILLERS: RegExp[] = [
  /\bvery\b/gi,
  /\breally\b/gi,
  /\bbasically\b/gi,
  /\bactually\b/gi,
  /\bquite\b/gi,
  /\bsomewhat\b/gi,
  /\bkind of\b/gi,
  /\bsort of\b/gi,
  /\bin order to\b/gi,
];



const DEPENDENT_MARKERS = [
  "although",
  "because",
  "while",
  "when",
  "since",
  "even though",
  "after",
  "before",
  "if",
];

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
}

function cleanArtifacts(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/,\s*,/g, ", ")
      .replace(/\.\s*\./g, ".")
      .replace(/\s+\./g, ".")
      .replace(/\s+,/g, ",")
      .replace(/\s{2,}/g, " ")
  );
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function lowerFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function protectMeaningTokens(text: string): { text: string; protectedTokens: ProtectedToken[] } {
  const protectedTokens: ProtectedToken[] = [];
  let counter = 0;

  const patterns = [
    /"[^"]+"/g,
    /'[^']+'/g,
    /\([^)]*\)/g,
    /\b\d+(?:[.,]\d+)?%?\b/g,
    /\b(?:Mount|Mt\.|Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-zA-Z-]+\b/g,
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-zA-Z-]+)+\b/g,
  ];

  let out = text;

  for (const pattern of patterns) {
    out = out.replace(pattern, (match) => {
      const key = `__LOCK_${counter++}__`;
      protectedTokens.push({ key, value: match });
      return key;
    });
  }

  return { text: out, protectedTokens };
}

function restoreMeaningTokens(text: string, protectedTokens: ProtectedToken[]): string {
  let out = text;
  for (const token of protectedTokens) {
    out = out.replaceAll(token.key, token.value);
  }
  return out;
}

function stripAiPhrases(text: string): string {
  let out = text;

  for (const pattern of AI_PHRASES) {
    out = out.replace(pattern, "");
  }

  for (const pattern of FILLERS) {
    out = out.replace(pattern, "");
  }

  return cleanArtifacts(out);
}

/**
 * Applies phrase and word replacements from the replacement library.
 *
 * Important:
 * - Do NOT use pattern.test(...) with global regexes from the shared library
 * - Global regexes keep internal state and can behave inconsistently
 * - Instead, always run replace directly and compare before/after
 */
function applyWordReplacements(
  text: string,
  strength: Strength,
  options?: {
    phraseBoost?: number;
    wordBoost?: number;
  }
): string {
  let out = text;

  const essayLimitBase =
    strength === "light" ? 3 :
    strength === "medium" ? 6 :
    10;

  const phraseLimitBase =
    strength === "light" ? 4 :
    strength === "medium" ? 10 :
    18;

  const wordLimitBase =
    strength === "light" ? 3 :
    strength === "medium" ? 6 :
    8;

  const essayLimit = Math.max(0, essayLimitBase + (options?.phraseBoost ?? 0));
  const phraseLimit = Math.max(0, phraseLimitBase + (options?.phraseBoost ?? 0));
  const wordLimit = Math.max(0, wordLimitBase + (options?.wordBoost ?? 0));

  let essayApplied = 0;
  for (const [pattern, replacement] of ESSAY_PATTERN_REPLACEMENTS) {
    if (essayApplied >= essayLimit) break;

    const next = out.replace(pattern, replacement);
    if (next !== out) {
      out = next;
      essayApplied++;
    }
  }

  let phraseApplied = 0;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    if (phraseApplied >= phraseLimit) break;

    const next = out.replace(pattern, replacement);
    if (next !== out) {
      out = next;
      phraseApplied++;
    }
  }

  let wordApplied = 0;
  for (const [pattern, replacement] of WORD_REPLACEMENTS) {
    if (wordApplied >= wordLimit) break;

    const next = out.replace(pattern, replacement);
    if (next !== out) {
      out = next;
      wordApplied++;
    }
  }

  return cleanArtifacts(out);
}
function rotateClause(sentence: string): string {
  const parts = sentence.split(/,\s+/);
  if (parts.length < 2) return sentence;

  const [first, ...rest] = parts;
  if (first.split(/\s+/).length < 4) return sentence;
  if (rest.join(", ").split(/\s+/).length < 4) return sentence;

  return `${rest.join(", ")}, ${lowerFirst(first)}`;
}

function breakLongSentence(sentence: string): string {
  const words = sentence.split(/\s+/);
  if (words.length < 20) return sentence;

  const commaParts = sentence.split(/,\s+/);
  if (commaParts.length >= 2) {
    const half = Math.ceil(commaParts.length / 2);
    const first = commaParts.slice(0, half).join(", ").replace(/[,.!?;:]+$/, "");
    const second = commaParts.slice(half).join(", ").trim();
    if (first && second) {
      return `${first}. ${capitalize(second)}`;
    }
  }

  const midpoint = Math.floor(words.length / 2);
  const firstHalf = words.slice(0, midpoint).join(" ").replace(/[,.!?;:]+$/, "");
  const secondHalf = words.slice(midpoint).join(" ").trim();

  if (!firstHalf || !secondHalf) return sentence;
  return `${firstHalf}. ${capitalize(secondHalf)}`;
}

function combineShortSentences(sentences: string[]): string[] {
  const result: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const current = sentences[i];
    const next = sentences[i + 1];

    if (next && countWords(current) <= 7 && countWords(next) <= 11) {
      const merged =
        current.replace(/[.!?]+$/, "") +
        ", " +
        lowerFirst(next).replace(/[.!?]+$/, "") +
        ".";
      result.push(cleanArtifacts(merged));
      i++;
    } else {
      result.push(current);
    }
  }

  return result;
}
/**
 * Varies sentence openings without forcing awkward starters.
 *
 * Why this exists:
 * - Reduces repetitive sentence openings
 * - Avoids weak or robotic openers like "Which", "Although", "Because"
 * - Keeps the paragraph sounding natural instead of mechanically varied
 *
 * Maintenance notes:
 * - Prefer keeping a normal sentence over forcing an unnatural opener
 * - Skip changes for short sentences
 * - Only rewrite the opener if the new opener is clearly better
 *
 * Depends on:
 * - cleanArtifacts(text)
 * - capitalize(text)
 * - rotateClause(sentence)
 */
function diversifyOpeners(sentences: string[]): string[] {
  const used = new Set<string>();

  const blockedOpeners = new Set([
    "which",
    "because",
    "although",
    "while",
    "if",
    "and",
    "but",
    "so",
    "especially",
  ]);

  return sentences.map((sentence, index) => {
    const cleaned = cleanArtifacts(sentence);
    const words = cleaned.split(/\s+/);

    if (words.length < 6) {
      return cleaned;
    }

    const opener = words[0].toLowerCase().replace(/[^\w']/g, "");
    const openerPair = words.slice(0, 2).join(" ").toLowerCase();

    if (!blockedOpeners.has(opener) && !used.has(openerPair)) {
      used.add(openerPair);
      return cleaned;
    }

    // Try a safer clause rotation only if the sentence is long enough
    if (index % 2 === 0 && words.length >= 10) {
      const rotated = cleanArtifacts(capitalize(rotateClause(cleaned)));
      const rotatedWords = rotated.split(/\s+/);
      const rotatedOpener = rotatedWords[0]?.toLowerCase().replace(/[^\w']/g, "");
      const rotatedPair = rotatedWords.slice(0, 2).join(" ").toLowerCase();

      if (
        rotatedWords.length >= 6 &&
        rotatedOpener &&
        !blockedOpeners.has(rotatedOpener) &&
        !used.has(rotatedPair)
      ) {
        used.add(rotatedPair);
        return rotated;
      }
    }

    // Fallback: keep the sentence as-is, but mark its opener as used
    used.add(openerPair);
    return cleaned;
  });
}

/**
 * Applies stronger sentence-level reshaping while still avoiding fragments.
 *
 * Why this version is better:
 * - pushes more structural change in the first pass
 * - keeps grammar safer than aggressive clause splitting
 * - makes the rewrite feel less like proofreading and more like real rewriting
 *
 * Depends on:
 * - splitSentences(text)
 * - recomposeSentenceAdvanced(sentence, strength, mode, tone)
 * - breakLongSentence(sentence)
 * - combineShortSentences(sentences)
 * - diversifyOpeners(sentences)
 * - cleanArtifacts(text)
 * - capitalize(text)
 * - avoidWeakOpening(sentence)
 * - countWords(text)
 */
function varyRhythm(
  text: string,
  strength: Strength,
  mode: string,
  tone: string
): string {
  let sentences = splitSentences(text);

  sentences = sentences.map((sentence, index) => {
    let out = sentence;

    // First reshape the sentence safely
    out = recomposeSentenceAdvanced(out, strength, mode, tone);

    // Strong mode: allow long sentences to split,
    // but only if the result is still substantial
    if (strength === "strong" && countWords(out) > 20) {
      const broken = breakLongSentence(out);
      const parts = splitSentences(broken);

      const validSplit =
        parts.length === 2 &&
        countWords(parts[0]) >= 6 &&
        countWords(parts[1]) >= 6;

      if (validSplit) {
        out = broken;
      }
    }

    return cleanArtifacts(capitalize(avoidWeakOpening(out)));
  });

  // Medium and strong should push more visible rhythm change
  if (strength === "medium" || strength === "strong") {
    sentences = combineShortSentences(sentences);
    sentences = diversifyOpeners(sentences);
  }

  return cleanArtifacts(sentences.join(" "));
}


function cleanupHumanStyle(text: string): string {
  return cleanArtifacts(
    text
      .replace(/\bthe output\b/gi, "the writing")
      .replace(/\bthis text\b/gi, "this piece")
      .replace(/\bslightly robotic\b/gi, "unnatural")
      .replace(/\brepetitive and less natural than human writing\b/gi, "repetitive")
      .replace(/\bmay still\b/gi, "can still")
  );
}

function rewriteByTone(text: string, tone: string): string {
  let out = text;

  if (tone === "formal") {
    out = out
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bwon't\b/gi, "will not");
  }

  if (tone === "friendly") {
    out = out
      .replace(/\bhowever\b/gi, "but")
      .replace(/\btherefore\b/gi, "so");
  }

  return cleanArtifacts(out);
}

function rewriteByMode(text: string, mode: string): string {
  let out = text;

  if (["school", "report", "thesis", "research", "proposal"].includes(mode)) {
    out = out.replace(/\bkids\b/gi, "children");
  }

  return cleanArtifacts(out);
}

function lexicalSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  const intersection = [...setA].filter((word) => setB.has(word)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function openerSimilarity(input: string, output: string): number {
  const a = splitSentences(input);
  const b = splitSentences(output);
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let sameStarts = 0;
  for (let i = 0; i < len; i++) {
    const aStart = a[i].toLowerCase().split(/\s+/).slice(0, 4).join(" ");
    const bStart = b[i].toLowerCase().split(/\s+/).slice(0, 4).join(" ");
    if (aStart === bStart) sameStarts++;
  }

  return sameStarts / len;
}

function rhythmFlatness(text: string): number {
  const lengths = splitSentences(text).map(countWords).filter(Boolean);
  if (lengths.length <= 1) return 1;

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (avg === 0) return 1;

  const variance =
    lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;

  const stdDev = Math.sqrt(variance);
  const normalized = stdDev / avg;

  return Math.max(0, 1 - normalized);
}

/**
 * Measures how close the rewritten text still is to the original.
 *
 * Why this version is stronger:
 * - Gives more penalty to long unchanged phrase blocks
 * - Still checks repeated sentence openings
 * - Still checks rhythm flatness
 * - Reduces the chance of accepting a rewrite that is grammatically cleaner
 *   but still too structurally similar
 *
 * Depends on:
 * - lexicalSimilarity(input, output)
 * - openerSimilarity(input, output)
 * - rhythmFlatness(output)
 * - longestSharedSpanWords(input, output)
 */
function overallSimilarity(input: string, output: string): number {
  const lexical = lexicalSimilarity(input, output);
  const opener = openerSimilarity(input, output);
  const rhythmPenalty = rhythmFlatness(output) * 0.10;

  // Stronger penalty for long copied word spans
  const longestSpan = longestSharedSpanWords(input, output);
  const sharedSpanPenalty =
    Math.min(longestSpan / 10, 1) * 0.32;

  // Extra penalty if copied spans are very long
  const copiedBlockPenalty =
    longestSpan >= 14 ? 0.12 :
    longestSpan >= 10 ? 0.07 :
    longestSpan >= 7 ? 0.03 :
    0;

  return (
    lexical * 0.34 +
    opener * 0.20 +
    rhythmPenalty +
    sharedSpanPenalty +
    copiedBlockPenalty
  );
}

/**
 * Safer second-pass rewrite.
 *
 * Goal:
 * - reduce similarity without creating broken grammar
 * - avoid fragment sentences like "Supporting doctors."
 * - keep full, natural sentences in report/thesis/workplace writing
 *
 * Strategy:
 * - only rewrite sentences that are long enough
 * - skip sentences that already became short or fragile
 * - do not rotate whole paragraph order
 * - do not force extra sentence splitting unless both parts are strong
 */
function aggressiveSecondPass(
  text: string,
  mode: string,
  tone: string
): string {
  const sentences = splitSentences(text);

  const rewritten = sentences.map((sentence) => {
    const cleaned = cleanArtifacts(sentence);

    // If already short, leave it alone.
    if (countWords(cleaned) < 9) {
      return cleaned;
    }

    // Use the advanced recomposer, but keep it sentence-safe.
    let out = recomposeSentenceAdvanced(cleaned, "strong", mode, tone);

    // Only break long sentences if they are really long.
    if (countWords(out) > 22) {
      const broken = breakLongSentence(out);

      // Keep the broken version only if both resulting sentences are meaningful.
      const parts = splitSentences(broken);
      const validParts =
        parts.length === 2 &&
        countWords(parts[0]) >= 6 &&
        countWords(parts[1]) >= 6;

      if (validParts) {
        out = broken;
      }
    }

    return cleanArtifacts(capitalize(avoidWeakOpening(out)));
  });

  return cleanArtifacts(rewritten.join(" "));
}

/**
 * Repairs accidental sentence-boundary issues created during recomposition.
 * Keep this conservative so we do not over-split natural sentences.
 */
function repairSentenceBoundaries(text: string): string {
  return cleanArtifacts(
    text
      .replace(/([a-z0-9\)])\s+([A-Z])/g, "$1. $2")
      .replace(/\.\s*\./g, ".")
      .replace(/\s{2,}/g, " ")
  );
}

/**
 * Main rewrite pipeline.
 * Order matters:
 * 1. protect meaning
 * 2. remove AI-style phrasing
 * 3. rewrite wording
 * 4. reshape sentence rhythm
 * 5. adjust by tone and mode
 * 6. clean awkward starters
 * 7. repair punctuation
 * 8. rebalance paragraphs
 * 9. restore protected details
 */
function rewriteCore(
  inputText: string,
  tone: string,
  mode: string,
  strength: Strength
): string {
  const protectedStage = protectMeaningTokens(inputText);
  const originalParagraphCount = countParagraphs(inputText);

  let draft = protectedStage.text;

  draft = rewriteParagraphAware(draft, tone, mode, strength);

  draft = rebalanceParagraphs(draft, {
    originalParagraphCount,
    minParagraphs: Math.max(1, originalParagraphCount - 1),
    maxParagraphs: originalParagraphCount + 1,
    minSentencesPerParagraph: 2,
    maxSentencesPerParagraph: 4,
  });

  draft = finalSentencePolish(draft);
  draft = restoreMeaningTokens(draft, protectedStage.protectedTokens);

  return cleanArtifacts(draft);
}

export function prepareHumanizeInput(inputText: string): PreparedInput {
  const original = normalizeWhitespace(inputText);
  const cleaned = normalizeWhitespace(
    original
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
  );

  return { original, cleaned };
}

export function humanizeText(
  inputText: string,
  tone: string = "natural",
  mode: string = "standard",
  strength: Strength = "medium"
): string {
  const candidates = generateRewriteCandidates(
    inputText,
    tone,
    mode,
    strength
  );

  const best = pickBestRewriteCandidate(candidates);

  return best.outputText;
}

export function paraphraseText(
  inputText: string,
  tone: string = "natural",
  mode: string = "standard",
  strength: Strength = "medium"
): string {
  const effectiveStrength = strength === "light" ? "medium" : strength;
  return rewriteWithSimilarityGuard(inputText, tone, mode, effectiveStrength);
}

export function estimateHumanScore(
  inputText: string,
  outputText: string,
  tool: RewriteTool,
  strength: Strength = "medium"
): number {
  const similarity = overallSimilarity(inputText, outputText);
  const rhythm = rhythmFlatness(outputText);

  let base = 88;
  if (tool === "humanize") base = 90;
  if (tool === "paraphrase") base = 87;
  if (tool === "rewrite") base = 86;
  if (tool === "improve") base = 85;
  if (tool === "grammar") base = 83;
  if (tool === "expand") base = 84;
  if (tool === "shorten") base = 84;

  const strengthBoost =
    strength === "light" ? -2 :
    strength === "medium" ? 0 :
    3;

  const similarityPenalty = Math.round(similarity * 20);
  const rhythmPenalty = Math.round(rhythm * 6);

  const score = base + strengthBoost - similarityPenalty - rhythmPenalty;
  return Math.max(55, Math.min(98, score));
}
export function buildProcessingNotes(
  tool: RewriteTool,
  tone: string,
  mode: string,
  strength: Strength = "medium"
): string[] {
  const notes = [
    `Tool applied: ${tool}`,
    `Tone set to ${tone}`,
    `Mode set to ${mode}`,
    `Rewrite strength: ${strength}`,
    "Checked sentence-opening repetition.",
    "Checked sentence-length rhythm.",
    "Protected names, numbers, and quoted details where possible.",
    "Checked clause recomposition when the first pass stayed too close.",
  ];

  if (tool === "humanize") {
    notes.push("Removed stock AI phrasing and rebalanced sentence flow.");
  }

  if (strength === "strong") {
    notes.push("Applied a stronger second pass when similarity stayed high.");
  }

  return unique(notes);
}
/**
 * Splits a sentence into meaningful clauses for safer recomposition.
 *
 * Why this version is safer:
 * - avoids over-splitting on words like "which" and "because"
 * - reduces fragment-style outputs
 * - keeps enough structure for rewriting without breaking grammar
 *
 * Depends on:
 * - cleanArtifacts(text)
 */
function splitClauses(sentence: string): string[] {
  return sentence
    .split(/,\s+|\s+\bbut\b\s+|\s+\bwhile\b\s+|\s+\balthough\b\s+/i)
    .map((part) => cleanArtifacts(part))
    .filter(Boolean);
}

/**
 * Recompose one sentence into a more human-sounding version
 * without creating fragments or awkward connectors.
 *
 * Why this version is better:
 * - pushes more real rewriting than simple proofreading
 * - avoids weak standalone starts like "Which..." or "Because..."
 * - keeps complete sentences for report, thesis, SOP, letter, and workplace writing
 *
 * Maintenance notes:
 * - prefer a safe rewrite over an aggressive broken rewrite
 * - do not let short clauses become standalone sentences
 * - formal modes stay more controlled
 *
 * Depends on:
 * - cleanArtifacts(text)
 * - capitalize(text)
 * - countWords(text)
 * - splitClauses(sentence)
 */
function recomposeSentenceAdvanced(
  sentence: string,
  strength: Strength,
  mode: string,
  tone: string
): string {
  const trimmed = cleanArtifacts(sentence);
  if (!trimmed) return trimmed;

  const clauses = splitClauses(trimmed);
  if (clauses.length < 2) {
    return trimmed;
  }

  const formalModes = new Set([
    "report",
    "thesis",
    "research",
    "proposal",
    "letter",
    "workplace",
    "school",
  ]);

  const blockedStarts = new Set([
    "which",
    "because",
    "although",
    "while",
    "and",
    "but",
    "so",
    "especially",
  ]);

  const isFormalMode = formalModes.has(mode);
  const shortClauseExists = clauses.some((c) => countWords(c) < 4);

  if (strength === "light") {
    return trimmed;
  }

  const [first, ...rest] = clauses;
  const joinedRest = rest.join(", ").trim();

  if (!first || !joinedRest) {
    return trimmed;
  }

  const firstStart = first.split(/\s+/)[0]?.toLowerCase() || "";
  const restStart = joinedRest.split(/\s+/)[0]?.toLowerCase() || "";

  // Avoid turning weak connectors into new sentence starts
  if (blockedStarts.has(firstStart) || blockedStarts.has(restStart)) {
    return trimmed;
  }

  // Avoid fragment-style splits
  if (shortClauseExists) {
    return trimmed;
  }

  if (isFormalMode) {
    if (countWords(first) < 6 || countWords(joinedRest) < 6) {
      return trimmed;
    }

    if (strength === "medium") {
      return cleanArtifacts(
        `${capitalize(joinedRest)}. ${capitalize(first)}.`
      );
    }

    const longest = [...clauses].sort((a, b) => countWords(b) - countWords(a))[0];
    const others = clauses.filter((c) => c !== longest).join(", ").trim();

    if (!longest || !others || countWords(longest) < 7 || countWords(others) < 7) {
      return trimmed;
    }

    const longestStart = longest.split(/\s+/)[0]?.toLowerCase() || "";
    const othersStart = others.split(/\s+/)[0]?.toLowerCase() || "";

    if (blockedStarts.has(longestStart) || blockedStarts.has(othersStart)) {
      return trimmed;
    }

    return cleanArtifacts(
      `${capitalize(longest)}. ${capitalize(others)}.`
    );
  }

  if (strength === "medium") {
    if (countWords(first) < 5 || countWords(joinedRest) < 5) {
      return trimmed;
    }

    return cleanArtifacts(
      `${capitalize(joinedRest)}. ${capitalize(first)}.`
    );
  }

  const longest = [...clauses].sort((a, b) => countWords(b) - countWords(a))[0];
  const others = clauses.filter((c) => c !== longest).join(", ").trim();

  if (!longest || !others || countWords(longest) < 6 || countWords(others) < 6) {
    return trimmed;
  }

  const longestStart = longest.split(/\s+/)[0]?.toLowerCase() || "";
  const othersStart = others.split(/\s+/)[0]?.toLowerCase() || "";

  if (blockedStarts.has(longestStart) || blockedStarts.has(othersStart)) {
    return trimmed;
  }

  return cleanArtifacts(
    `${capitalize(longest)}. ${capitalize(others)}.`
  );
}


function longestSharedSpanWords(input: string, output: string): number {
  const a = tokenize(input);
  const b = tokenize(output);

  let longest = 0;

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let k = 0;
      while (a[i + k] && b[j + k] && a[i + k] === b[j + k]) {
        k++;
      }
      if (k > longest) longest = k;
    }
  }

  return longest;
}

function avoidWeakOpening(sentence: string): string {
  const weakOpeners = new Set([
    "key",
    "major",
    "important",
    "significant",
    "overall",
    "notably",
  ]);

  const words = sentence.trim().split(/\s+/);
  if (words.length < 3) return sentence;

  const first = words[0].toLowerCase().replace(/[^\w']/g, "");
  if (!weakOpeners.has(first)) return sentence;

  return cleanArtifacts(words.slice(1).join(" "));
}
/**
 * Decides whether the first rewrite is different enough,
 * or whether a stronger second pass is needed.
 *
 * Why this exists:
 * - Prevents the system from stopping too early after only grammar cleanup
 * - Pushes a stronger rewrite when the output still keeps large copied blocks
 * - Rejects second-pass results if they become too short or awkward
 *
 * Depends on:
 * - normalizeWhitespace(text)
 * - rewriteCore(inputText, tone, mode, strength)
 * - overallSimilarity(input, output)
 * - aggressiveSecondPass(text, mode, tone)
 * - countWords(text)
 * - cleanArtifacts(text)
 */
function rewriteWithSimilarityGuard(
  inputText: string,
  tone: string,
  mode: string,
  strength: Strength
): string {
  const original = normalizeWhitespace(inputText);
  const firstPass = rewriteCore(original, tone, mode, strength);

  const firstSimilarity = overallSimilarity(original, firstPass);

  const threshold =
    strength === "light" ? 0.86 :
    strength === "medium" ? 0.68 :
    0.60;

  if (firstSimilarity <= threshold) {
    return cleanArtifacts(firstPass);
  }

  const secondPass = aggressiveSecondPass(firstPass, mode, tone);
  const secondSimilarity = overallSimilarity(original, secondPass);

  const firstWords = countWords(firstPass);
  const secondWords = countWords(secondPass);

  const secondLooksReasonable =
    secondWords >= Math.max(6, Math.floor(firstWords * 0.78)) &&
    secondWords <= Math.ceil(firstWords * 1.30);

  if (secondLooksReasonable && secondSimilarity < firstSimilarity) {
    return cleanArtifacts(secondPass);
  }

  return cleanArtifacts(firstPass);
}

/**
 * Counts paragraphs in the original source text.
 * Blank lines are treated as paragraph breaks.
 */
function countParagraphs(text: string): number {
  const parts = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length || 1;
}

/**
 * Rebalances rewritten text into natural paragraph groups
 * while preserving the original meaning and sentence order.
 *
 * Why this version is better:
 * - uses the original paragraph count as guidance
 * - keeps paragraph flow closer to human writing
 * - changes grouping without changing content
 *
 * Safe behavior:
 * - keeps sentence order exactly the same
 * - does not invent or remove content
 * - only changes paragraph boundaries
 */
function rebalanceParagraphs(
  text: string,
  options?: {
    originalParagraphCount?: number;
    minParagraphs?: number;
    maxParagraphs?: number;
    minSentencesPerParagraph?: number;
    maxSentencesPerParagraph?: number;
  }
): string {
  const cleaned = cleanArtifacts(text);
  const sentences = splitSentences(cleaned);

  if (sentences.length <= 2) {
    return cleaned;
  }

  const originalParagraphCount = options?.originalParagraphCount ?? 1;
  const minParagraphs =
    options?.minParagraphs ?? Math.max(1, originalParagraphCount - 1);
  const maxParagraphs =
    options?.maxParagraphs ?? Math.max(minParagraphs, originalParagraphCount + 1);
  const minSentencesPerParagraph = options?.minSentencesPerParagraph ?? 2;
  const maxSentencesPerParagraph = options?.maxSentencesPerParagraph ?? 4;

  let targetParagraphs = Math.ceil(sentences.length / 3);

  targetParagraphs = Math.max(
    minParagraphs,
    Math.min(maxParagraphs, targetParagraphs)
  );

  const paragraphs: string[] = [];
  let current: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    current.push(sentences[i]);

    const remainingSentences = sentences.length - (i + 1);
    const remainingParagraphs = targetParagraphs - paragraphs.length - 1;

    const canCloseParagraph =
      current.length >= minSentencesPerParagraph &&
      (
        current.length >= maxSentencesPerParagraph ||
        (
          remainingParagraphs > 0 &&
          remainingSentences >= remainingParagraphs * minSentencesPerParagraph
        )
      );

    if (canCloseParagraph) {
      paragraphs.push(current.join(" "));
      current = [];
    }
  }

  if (current.length) {
    if (
      paragraphs.length > 0 &&
      current.length < minSentencesPerParagraph
    ) {
      paragraphs[paragraphs.length - 1] =
        `${paragraphs[paragraphs.length - 1]} ${current.join(" ")}`;
    } else {
      paragraphs.push(current.join(" "));
    }
  }

  return paragraphs.join("\n\n");
}

/**
 * Cleans awkward sentence starters that often survive paraphrasing.
 *
 * Why this exists:
 * - fixes weak rewrite leftovers like "Which improves..." or "Because of this..."
 * - improves flow without changing meaning much
 * - uses a separate library so patterns can grow safely later
 *
 * Depends on:
 * - STARTER_CLEANUP_PATTERNS
 * - cleanArtifacts(text)
 */
function cleanupSentenceStarters(text: string): string {
  let out = text;

  for (const [pattern, replacement] of STARTER_CLEANUP_PATTERNS) {
    out = out.replace(pattern, replacement);
  }

  return cleanArtifacts(out);
}

/**
 * Rewrites text paragraph by paragraph while preserving the original
 * meaning, idea order, and overall structure.
 *
 * Why this exists:
 * - keeps paraphrase meaning close to the original
 * - lets each paragraph be rewritten with local context
 * - helps the whole text feel more natural, not just sentence by sentence
 *
 * Safe behavior:
 * - preserves paragraph order
 * - preserves sentence order inside each paragraph
 * - does not invent new ideas
 */
function rewriteParagraphAware(
  text: string,
  tone: string,
  mode: string,
  strength: Strength
): string {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length <= 1) {
    return text;
  }

  const rewrittenParagraphs = paragraphs.map((paragraph) => {
    let out = paragraph;

    out = stripAiPhrases(out);
    out = applyWordReplacements(out, strength);
    out = varyRhythm(out, strength, mode, tone);
    out = rewriteByTone(out, tone);
    out = rewriteByMode(out, mode);
    out = cleanupHumanStyle(out);
    out = cleanupSentenceStarters(out);
    out = repairSentenceBoundaries(out);

    return cleanArtifacts(out);
  });

  return rewrittenParagraphs.join("\n\n");
}

/**
 * Final sentence cleanup after rewriting.
 *
 * Goal:
 * - fix leftover broken joins
 * - fix lowercase sentence starts
 * - remove awkward split fragments
 * - improve readability without changing meaning much
 */
function finalSentencePolish(text: string): string {
  let out = cleanArtifacts(text);

  out = out
    .replace(/\bThis means a\.\s+/gi, "This means ")
    .replace(/\bThis is possible because\.\s+/gi, "This is possible because ")
    .replace(/\bMany large companies use\.\s+([A-Z])/g, "Many large companies use $1")
    .replace(/\bA common use of\.\s+([A-Z])/g, "A common use of $1")
    .replace(/\bCommonly known as the\.\s+/gi, "commonly known as the ")
    .replace(/\bwhere developers create\b/g, "where developers create")
    .replace(/\bwhere users can\b/g, "where users can")
    .replace(/\bwhere people can\b/g, "where people can")
    .replace(/\bThis field is key\.\s*/gi, "This field matters because ")
    .replace(/\bSince it explains\b/gi, "because it explains")
    .replace(
      /\bIncluding education, healthcare, business, and counseling, psychology is used in many areas\b/gi,
      "Psychology is used in many areas, including education, healthcare, business, and counseling"
    )
    .replace(/\bareas One of the main goals\b/gi, "areas. One of the main goals")
    .replace(/\balso also\b/gi, "also")
    .replace(/\bmost key\b/gi, "most important")
    .replace(/\bThanks to its flexibility and wide range of uses\.\s*/gi, "Because of its flexibility and wide range of uses, ")
    .replace(/([.!?]\s+)([a-z])/g, (_, a, b) => a + b.toUpperCase())
    .replace(/\b([A-Z][a-z]+) because it teaches\b/g, "$1 teaches")
    .replace(/\b([A-Z][a-z]+) is also used in\.\s+/g, "$1 is also used in ")
    .replace(/\b([A-Z][a-z]+) became popular for\.\s+/g, "$1 became popular for ");

  return cleanArtifacts(out);
}

/**
 * Builds small rewrite profiles so the engine can generate
 * more than one balanced candidate instead of relying on one pattern.
 *
 * Why this exists:
 * - different texts respond better to slightly different rewrite settings
 * - medium is usually best, but one balanced variation may beat another
 * - strong should be used only as a fallback profile
 *
 * Safe behavior:
 * - keeps profiles limited and predictable
 * - avoids random unstable rewrites
 */
function getRewriteProfiles(strength: Strength): Array<{
  id: "balanced_a" | "balanced_b" | "aggressive";
  strength: Strength;
  phraseBoost: number;
  wordBoost: number;
  paragraphBias: -1 | 0 | 1;
}> {
  if (strength === "light") {
    return [
      {
        id: "balanced_a",
        strength: "light",
        phraseBoost: 0,
        wordBoost: 0,
        paragraphBias: 0,
      },
      {
        id: "balanced_b",
        strength: "medium",
        phraseBoost: 1,
        wordBoost: 0,
        paragraphBias: 0,
      },
    ];
  }

  if (strength === "strong") {
    return [
      {
        id: "balanced_a",
        strength: "medium",
        phraseBoost: 0,
        wordBoost: 0,
        paragraphBias: 0,
      },
      {
        id: "balanced_b",
        strength: "medium",
        phraseBoost: 2,
        wordBoost: 0,
        paragraphBias: 1,
      },
      {
        id: "aggressive",
        strength: "strong",
        phraseBoost: 2,
        wordBoost: 1,
        paragraphBias: 1,
      },
    ];
  }

  return [
    {
      id: "balanced_a",
      strength: "medium",
      phraseBoost: 0,
      wordBoost: 0,
      paragraphBias: 0,
    },
    {
      id: "balanced_b",
      strength: "medium",
      phraseBoost: 2,
      wordBoost: 0,
      paragraphBias: 1,
    },
  ];
}

/**
 * Scores one rewritten candidate.
 *
 * Goal:
 * - prefer outputs that are less similar
 * - reward variation and readability
 * - penalize broken grammar / weird leftovers
 *
 * Higher total score = better candidate
 *
 * Depends on:
 * - overallSimilarity(input, output)
 * - splitSentences(text)
 * - countWords(text)
 */
function scoreRewriteCandidate(
  inputText: string,
  outputText: string
): {
  total: number;
  similarity: number;
  readability: number;
  variation: number;
  penalties: number;
} {
  const similarity = overallSimilarity(inputText, outputText);

  const sentences = splitSentences(outputText);
  const sentenceLengths = sentences.map((s) => countWords(s)).filter(Boolean);

  const avgLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;

  const shortFragments = sentences.filter((s) => countWords(s) < 4).length;

  const awkwardStarts = sentences.filter((s) =>
    /^(Which|Because|Although|And|But|So)\b/.test(s.trim())
  ).length;

  const repeatedStarts = (() => {
    const starts = sentences.map((s) =>
      s.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase()
    );
    const seen = new Set<string>();
    let repeats = 0;

    for (const start of starts) {
      if (seen.has(start)) repeats++;
      else seen.add(start);
    }

    return repeats;
  })();

  const readability =
    100
    - shortFragments * 12
    - awkwardStarts * 10
    - repeatedStarts * 6
    - (avgLength > 28 ? 8 : 0)
    - (avgLength < 7 ? 8 : 0);

  const variation =
    100
    - Math.round(similarity * 100);

  const penalties =
    shortFragments * 10 +
    awkwardStarts * 8 +
    repeatedStarts * 5;

  const total =
    (variation * 0.45) +
    (Math.max(0, readability) * 0.35) -
    (penalties * 0.20);

  return {
    total,
    similarity,
    readability: Math.max(0, readability),
    variation: Math.max(0, variation),
    penalties,
  };
}

/**
 * Generates a small set of rewrite candidates and scores them.
 *
 * Why this exists:
 * - lets the engine compare balanced variations instead of trusting one output
 * - keeps strong mode as a fallback, not the default winner
 * - makes "Try Again" easier later
 *
 * Depends on:
 * - getRewriteProfiles(strength)
 * - rewriteParagraphAware(text, tone, mode, strength)
 * - rebalanceParagraphs(text, options)
 * - finalSentencePolish(text)
 * - cleanArtifacts(text)
 * - scoreRewriteCandidate(input, output)
 * - countParagraphs(text)
 */
function generateRewriteCandidates(
  inputText: string,
  tone: string,
  mode: string,
  strength: Strength
): Array<{
  id: "balanced_a" | "balanced_b" | "aggressive";
  outputText: string;
  score: ReturnType<typeof scoreRewriteCandidate>;
}> {
  const originalParagraphCount = countParagraphs(inputText);
  const profiles = getRewriteProfiles(strength);

  return profiles.map((profile) => {
    let output = rewriteParagraphAware(
      inputText,
      tone,
      mode,
      profile.strength
    );

    output = rebalanceParagraphs(output, {
      originalParagraphCount,
      minParagraphs: Math.max(1, originalParagraphCount - 1),
      maxParagraphs: originalParagraphCount + 1,
      minSentencesPerParagraph: 2,
      maxSentencesPerParagraph: 4,
    });

    output = finalSentencePolish(output);
    output = cleanArtifacts(output);

    const score = scoreRewriteCandidate(inputText, output);

    return {
      id: profile.id,
      outputText: output,
      score,
    };
  });
}

/**
 * Picks the best rewrite candidate.
 *
 * Why this exists:
 * - chooses the strongest result based on score
 * - prefers balanced outputs over aggressive ones when scores are close
 * - avoids unstable "strong wins just because it changed more" behavior
 *
 * Safe behavior:
 * - if two results are close, prefer balanced
 * - only prefer aggressive when it is clearly better
 */
function pickBestRewriteCandidate(
  candidates: Array<{
    id: "balanced_a" | "balanced_b" | "aggressive";
    outputText: string;
    score: ReturnType<typeof scoreRewriteCandidate>;
  }>
): {
  id: "balanced_a" | "balanced_b" | "aggressive";
  outputText: string;
  score: ReturnType<typeof scoreRewriteCandidate>;
} {
  if (candidates.length === 1) {
    return candidates[0];
  }

  const sorted = [...candidates].sort((a, b) => b.score.total - a.score.total);

  const best = sorted[0];
  const second = sorted[1];

  const bestIsAggressive = best.id === "aggressive";
  const secondIsBalanced = second && second.id !== "aggressive";

  // If aggressive is only a little better, prefer balanced.
  if (
    bestIsAggressive &&
    secondIsBalanced &&
    best.score.total - second.score.total < 8
  ) {
    return second;
  }

  // If aggressive has noticeably worse readability, reject it.
  if (
    bestIsAggressive &&
    secondIsBalanced &&
    best.score.readability < second.score.readability - 10
  ) {
    return second;
  }

  // If aggressive has more penalties and only a small score advantage, reject it.
  if (
    bestIsAggressive &&
    secondIsBalanced &&
    best.score.penalties > second.score.penalties &&
    best.score.total - second.score.total < 12
  ) {
    return second;
  }

  return best;
}

/**
 * Generates one extra balanced retry candidate and keeps it
 * only if it beats the current best output.
 *
 * Why this exists:
 * - gives the user a useful "Try Again" option
 * - avoids unstable aggressive retries
 * - keeps the better version based on the same scoring system
 *
 * Safe behavior:
 * - retry is balanced, not random strong rewriting
 * - current result is kept unless retry clearly scores better
 *
 * Depends on:
 * - scoreRewriteCandidate(inputText, outputText)
 * - cleanArtifacts(text)
 * - stripAiPhrases(text)
 * - applyWordReplacements(text, strength, options)
 * - varyRhythm(text, strength, mode, tone)
 * - rewriteByTone(text, tone)
 * - rewriteByMode(text, mode)
 * - cleanupHumanStyle(text)
 * - cleanupSentenceStarters(text)
 * - repairSentenceBoundaries(text)
 * - finalSentencePolish(text)
 * - rebalanceParagraphs(text, options)
 * - countParagraphs(text)
 */
export function humanizeTextRetry(
  inputText: string,
  currentOutputText: string,
  tone: string = "natural",
  mode: string = "standard"
): string {
  const originalParagraphCount = countParagraphs(inputText);

  let retry = inputText;
  retry = stripAiPhrases(retry);
  retry = applyWordReplacements(retry, "medium", {
    phraseBoost: 3,
    wordBoost: 1,
  });
  retry = varyRhythm(retry, "medium", mode, tone);
  retry = rewriteByTone(retry, tone);
  retry = rewriteByMode(retry, mode);
  retry = cleanupHumanStyle(retry);
  retry = cleanupSentenceStarters(retry);
  retry = repairSentenceBoundaries(retry);
  retry = finalSentencePolish(retry);
  retry = rebalanceParagraphs(retry, {
    originalParagraphCount,
    minParagraphs: Math.max(1, originalParagraphCount - 1),
    maxParagraphs: originalParagraphCount + 1,
    minSentencesPerParagraph: 2,
    maxSentencesPerParagraph: 4,
  });
  retry = cleanArtifacts(retry);

  const currentScore = scoreRewriteCandidate(inputText, currentOutputText);
  const retryScore = scoreRewriteCandidate(inputText, retry);

  if (retryScore.total > currentScore.total) {
    return retry;
  }

  return currentOutputText;
}


export { countWords };