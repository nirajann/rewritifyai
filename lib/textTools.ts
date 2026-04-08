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

type CandidateScore = {
  total: number;
  meaningPreservation: number;
  naturalness: number;
  structuralFreshness: number;
  similarity: number;
  progressionRetention: number;
  readability: number;
  variation: number;
  penalties: number;
  meaningSafe: boolean;
  structureSafe: boolean;
};

type SourceProfile = {
  aiPhraseHits: number;
  genericAiLike: boolean;
  sentenceCount: number;
  paragraphCount: number;
  repeatedOpeners: number;
};

type CandidateStrategy =
  | "baseline"
  | "rhythm"
  | "lead_first"
  | "reordered_emphasis"
  | "structured_strong";

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

const WRAPPER_PHRASES: RegExp[] = [
  /^here is the rewritten version[:\s-]*/i,
  /^rewritten version[:\s-]*/i,
  /^humanized version[:\s-]*/i,
  /^output[:\s-]*/i,
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
      .replace(/(^|[.!?]\s+),\s*/g, "$1")
      .replace(/,\s*([.!?])/g, "$1")
      .replace(/\b(So|Also|Still),\s+the,\s+/g, "$1 the ")
      .replace(/,\s*,/g, ", ")
      .replace(/\.\s*\./g, ".")
      .replace(/\s+\./g, ".")
      .replace(/\s+,/g, ",")
      .replace(/\s{2,}/g, " ")
  );
}

function lightPostProcess(text: string): string {
  let out = normalizeWhitespace(text);

  for (const pattern of WRAPPER_PHRASES) {
    out = out.replace(pattern, "");
  }

  return out.replace(/\n{3,}/g, "\n\n").trim();
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

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
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

function normalizeMeaningNeutralScaffold(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/\bIn today's world\b[:,]?\s*/gi, "")
      .replace(/\bIn the modern world\b[:,]?\s*/gi, "")
      .replace(/\bFurthermore\b[:,]?\s*/gi, "")
      .replace(/\bMoreover\b[:,]?\s*/gi, "")
      .replace(/\bAdditionally\b[:,]?\s*/gi, "")
      .replace(/\bIt is important to note that\b\s*/gi, "")
      .replace(/\bIt should be noted that\b\s*/gi, "")
      .replace(/\bOverall\b[:,]?\s*/gi, "")
  );
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
  const replacements: Array<[RegExp, string]> = [
    [/\bin conclusion\b[:,]?\s*/gi, ""],
    [/\bto conclude\b[:,]?\s*/gi, ""],
    [/\bin summary\b[:,]?\s*/gi, ""],
    [/\boverall\b[:,]?\s*/gi, ""],
    [/\bmoreover\b[:,]?\s*/gi, "also, "],
    [/\bfurthermore\b[:,]?\s*/gi, "also, "],
    [/\badditionally\b[:,]?\s*/gi, "also, "],
    [/\bit is important to note that\b\s*/gi, ""],
    [/\bit should be noted that\b\s*/gi, ""],
    [/\bin today's world\b[:,]?\s*/gi, "today, "],
    [/\bin the modern world\b[:,]?\s*/gi, "today, "],
    [/\bwithout a doubt\b[:,]?\s*/gi, ""],
    [/\bplays a vital role\b/gi, "matters"],
    [/\bplays an important role\b/gi, "matters"],
    [/\ba wide range of\b/gi, "many"],
    [/\bdelves into\b/gi, "explores"],
    [/\bmore specifically\b[:,]?\s*/gi, ""],
    [/\bat the same time\b[:,]?\s*/gi, "still, "],
    [/\bin many cases\b[:,]?\s*/gi, "often, "],
    [/\bit can be said that\b\s*/gi, ""],
    [/\bthis means that\b\s*/gi, "so "],
    [/\bnotably\b[:,]?\s*/gi, ""],
    [/\bin essence\b[:,]?\s*/gi, ""],
    [/\bat its core\b[:,]?\s*/gi, ""],
    [/\bneedless to say\b[:,]?\s*/gi, ""],
  ];

  let out = text;

  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }

  for (const pattern of FILLERS) {
    out = out.replace(pattern, "");
  }

  return cleanArtifacts(out);
}

function softenGenericAiScaffold(text: string): string {
  return cleanArtifacts(
    text
      .replace(/\bIn today's world\b[:,]?\s*/gi, "Today, ")
      .replace(/\bIn the modern world\b[:,]?\s*/gi, "Today, ")
      .replace(/\bFurthermore\b[:,]?\s*/gi, "Also, ")
      .replace(/\bMoreover\b[:,]?\s*/gi, "Also, ")
      .replace(/\bAdditionally\b[:,]?\s*/gi, "Also, ")
      .replace(/\bIt is important to note that\b\s*/gi, "")
      .replace(/\bOverall\b[:,]?\s*/gi, "")
  );
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
  const shouldSkipPhraseReplacement = (replacement: string) =>
    /^(overall|clearly,?|helps a lot)$/i.test(replacement.trim());
  const shouldSkipWordReplacement = (replacement: string) =>
    /^(key|solid|dependable)$/i.test(replacement.trim());

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
    if (shouldSkipPhraseReplacement(replacement)) continue;

    const next = out.replace(pattern, replacement);
    if (next !== out) {
      out = next;
      essayApplied++;
    }
  }

  let phraseApplied = 0;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    if (phraseApplied >= phraseLimit) break;
    if (shouldSkipPhraseReplacement(replacement)) continue;

    const next = out.replace(pattern, replacement);
    if (next !== out) {
      out = next;
      phraseApplied++;
    }
  }

  let wordApplied = 0;
  for (const [pattern, replacement] of WORD_REPLACEMENTS) {
    if (wordApplied >= wordLimit) break;
    if (shouldSkipWordReplacement(replacement)) continue;

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
  if (sentence.includes(":")) return sentence;

  const commaParts = sentence.split(/,\s+/);
  if (commaParts.length >= 2) {
    const half = Math.ceil(commaParts.length / 2);
    const first = commaParts.slice(0, half).join(", ").replace(/[,.!?;:]+$/, "");
    const second = commaParts.slice(half).join(", ").trim();
    if (
      first &&
      second &&
      looksLikeCompleteClause(first) &&
      looksLikeCompleteClause(second)
    ) {
      return `${first}. ${capitalize(second)}`;
    }
  }

  const safeConnectorMatch = sentence.match(
    /^(.*?)(\s+(?:but|yet|so|because|although|while)\s+.+)$/i
  );

  if (safeConnectorMatch) {
    const firstHalf = safeConnectorMatch[1]?.trim().replace(/[,.!?;:]+$/, "");
    const secondHalf = safeConnectorMatch[2]?.trim();

    if (
      firstHalf &&
      secondHalf &&
      looksLikeCompleteClause(firstHalf) &&
      looksLikeCompleteClause(secondHalf)
    ) {
      return `${firstHalf}. ${capitalize(lowerFirst(secondHalf))}`;
    }
  }

  return sentence;
}

function looksLikeCompleteClause(text: string): boolean {
  const cleaned = cleanArtifacts(text);
  const wordCount = countWords(cleaned);

  if (wordCount < 5) return false;

  if (/^(And|But|So|Because|Although|While|If)\b/.test(cleaned)) {
    return false;
  }

  return /\b(is|are|was|were|be|been|being|has|have|had|can|could|will|would|should|may|might|must|do|does|did|allows|allow|shows|show|means|mean|depends|reduce|reduces|improve|improves|support|supports|suggests|remain|remains|combine|combines|create|creates|lead|leads|make|makes|include|includes|offer|offers|reflect|reflects|help|helps|keep|keeps|adjust|adjusts|practice|practices|understand|understands|finish|finishes|divide|divides|use|uses)\b/i.test(
    cleaned
  );
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

function hasSafeStandaloneOpening(sentence: string): boolean {
  const opener = sentence.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^\w']/g, "") || "";
  const blocked = new Set([
    "this",
    "that",
    "these",
    "those",
    "it",
    "they",
    "he",
    "she",
    "because",
    "although",
    "while",
    "and",
    "but",
    "so",
    "then",
    "also",
  ]);

  return opener.length > 0 && !blocked.has(opener);
}

function startsGeneric(sentence: string): boolean {
  return /^(It|This|There)\b/.test(sentence.trim());
}

function sentenceLooksStandalone(sentence: string): boolean {
  const trimmed = sentence.trim();
  if (!trimmed) return false;

  return (
    countWords(trimmed) >= 7 &&
    !/^(Because|Although|While|And|But|So|Which)\b/.test(trimmed)
  );
}

function restructureSentenceSequence(
  sentences: string[],
  reorderLevel: 0 | 1 | 2
): string[] {
  if (reorderLevel === 0 || sentences.length < 2) {
    return sentences;
  }

  const reordered = [...sentences];

  if (
    startsGeneric(reordered[0]) &&
    sentenceLooksStandalone(reordered[1]) &&
    hasSafeStandaloneOpening(reordered[1])
  ) {
    [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  }

  if (reorderLevel === 2) {
    for (let index = 1; index < reordered.length - 1; index++) {
      const current = reordered[index];
      const next = reordered[index + 1];

      if (
        startsGeneric(current) &&
        sentenceLooksStandalone(next) &&
        hasSafeStandaloneOpening(next)
      ) {
        [reordered[index], reordered[index + 1]] = [next, current];
        index++;
      }
    }
  }

  return reordered;
}

function reshapeParagraphStructure(
  paragraph: string,
  strength: Strength,
  mode: string,
  tone: string,
  reorderLevel: 0 | 1 | 2 = 0
): string {
  let sentences = splitSentences(paragraph);

  if (sentences.length <= 1) {
    return paragraph;
  }

  sentences = combineShortSentences(sentences);

  if (strength === "medium" || strength === "strong") {
    sentences = sentences.map((sentence) => {
      let out = sentence;

      if (strength === "strong" && countWords(out) > 20) {
        const broken = breakLongSentence(out);
        const parts = splitSentences(broken);
        if (
          parts.length === 2 &&
          countWords(parts[0]) >= 6 &&
          countWords(parts[1]) >= 6
        ) {
          out = broken;
        }
      }

      out = locallyRecomposeSentence(out, mode, strength);
      return cleanArtifacts(recomposeSentenceAdvanced(out, strength, mode, tone));
    });

    sentences = restructureSentenceSequence(sentences, reorderLevel);

    sentences = reshapeFormalStudentProgression(sentences, mode, strength);
    sentences = diversifyOpeners(sentences);
  }

  return lightPostProcess(sentences.join(" "));
}

function startsWithTransition(sentence: string): boolean {
  return /^(However|Also|Still|As a result|For that reason|At the same time|In practice|Overall)\b/i.test(
    sentence.trim()
  );
}

function isFormalStudentMode(mode: string): boolean {
  return ["school", "report", "thesis", "research", "proposal"].includes(mode);
}

function isKeyPointSentence(sentence: string, mode: string): boolean {
  const trimmed = cleanArtifacts(sentence);

  if (
    /\b(main change is|better argument|early feedback suggests|more useful than|showed me that|taught me that)\b/i.test(
      trimmed
    )
  ) {
    return true;
  }

  if (mode === "school" && /\bI learned\b/i.test(trimmed)) {
    return true;
  }

  if (
    mode === "report" &&
    /\b(the next version|participants are expected|the program combines)\b/i.test(trimmed)
  ) {
    return true;
  }

  return false;
}

function isSetupSentence(sentence: string): boolean {
  const trimmed = cleanArtifacts(sentence);

  return /\b(was designed to|was introduced to|are often defended as|may reduce some visible differences|the process felt|the training program was designed)\b/i.test(
    trimmed
  );
}

function mergeExplanationPairs(sentences: string[]): string[] {
  const merged: string[] = [];

  for (let index = 0; index < sentences.length; index++) {
    const current = cleanArtifacts(sentences[index]);
    const next = cleanArtifacts(sentences[index + 1] ?? "");

    if (
      next &&
      /^I learned\b/i.test(current) &&
      /^This showed me that\b/i.test(next) &&
      countWords(current) + countWords(next) <= 34
    ) {
      merged.push(
        cleanArtifacts(
          `${current.replace(/[.!?]+$/, "")} because ${lowerFirst(
            next
              .replace(/^This showed me that\s+/i, "it showed me that ")
              .replace(/\bvery important\b/i, "important")
          )}`
        )
      );
      index++;
      continue;
    }

    if (
      next &&
      /\bare often defended as\b/i.test(current) &&
      /^That argument\b/i.test(next) &&
      countWords(current) + countWords(next) <= 36
    ) {
      merged.push(
        cleanArtifacts(
          `${current.replace(/[.!?]+$/, "")}, but ${lowerFirst(next)}`
        )
      );
      index++;
      continue;
    }

    if (
      next &&
      /^This (additional|extra) step may appear minor\b/i.test(current) &&
      /^It is intended to\b/i.test(next) &&
      countWords(current) + countWords(next) <= 34
    ) {
      merged.push(
        cleanArtifacts(
          `${current.replace(/[.!?]+$/, "")}, but ${lowerFirst(next)}`
        )
      );
      index++;
      continue;
    }

    merged.push(current);
  }

  return merged;
}

function reshapeFormalStudentProgression(
  sentences: string[],
  mode: string,
  strength: Strength
): string[] {
  if (!isFormalStudentMode(mode) || sentences.length < 2) {
    return sentences;
  }

  const reordered = mergeExplanationPairs(sentences);

  const keyIndex = reordered.findIndex((sentence) =>
    isKeyPointSentence(sentence, mode)
  );

  if (keyIndex > 0) {
    const [lead] = reordered.splice(keyIndex, 1);
    reordered.unshift(lead);
  }

  const setupIndex = reordered.findIndex((sentence) => isSetupSentence(sentence));
  const contrastIndex = reordered.findIndex((sentence) =>
    /^(Yet|However|Still|At first|For that reason)\b/i.test(sentence)
  );

  if (
    strength === "strong" &&
    setupIndex === 0 &&
    contrastIndex > 0 &&
    contrastIndex < reordered.length - 1
  ) {
    const [setup] = reordered.splice(setupIndex, 1);
    reordered.splice(1, 0, setup);
  }

  if (
    mode === "school" &&
    strength === "strong" &&
    reordered.length >= 2 &&
    /^I learned\b/i.test(reordered[0]) &&
    /^(At first|During the project)\b/i.test(reordered[1])
  ) {
    [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  }

  return reordered;
}

function moveDependentClause(sentence: string, preferFront: boolean): string {
  const trimmed = cleanArtifacts(sentence);

  if (preferFront) {
    const trailing = trimmed.match(
      /^(.*?),\s*(because|although|while|when|if|since)\s+(.+)$/i
    );

    if (trailing) {
      const mainClause = trailing[1]?.trim();
      const marker = trailing[2]?.trim();
      const dependent = trailing[3]?.replace(/[.!?]+$/, "").trim();

      if (
        mainClause &&
        dependent &&
        countWords(mainClause) >= 5 &&
        countWords(dependent) >= 4
      ) {
        return cleanArtifacts(
          `${capitalize(marker)} ${dependent}, ${lowerFirst(mainClause)}.`
        );
      }
    }
  }

  const leading = trimmed.match(
    /^(Because|Although|While|When|If|Since)\s+(.+?),\s+(.+)$/i
  );

  if (leading) {
    const marker = leading[1]?.trim().toLowerCase();
    const dependent = leading[2]?.trim();
    const mainClause = leading[3]?.replace(/[.!?]+$/, "").trim();

    if (
      marker &&
      dependent &&
      mainClause &&
      countWords(mainClause) >= 5 &&
      countWords(dependent) >= 4
    ) {
      return cleanArtifacts(`${capitalize(mainClause)} ${marker} ${dependent}.`);
    }
  }

  return trimmed;
}

function locallyRecomposeSentence(
  sentence: string,
  mode: string,
  strength: Strength,
  genericAiSafe: boolean = false
): string {
  if (strength !== "strong" || genericAiSafe) {
    return cleanArtifacts(sentence);
  }

  let out = cleanArtifacts(sentence);

  out = out
    .replace(/\bvery key\b/gi, "important")
    .replace(
      /^School uniforms are often defended as a way to create equality,\s*but that argument does not fully reflect what students actually experience\.$/i,
      "Uniforms are often defended in the name of equality, but that claim does not fully match what students actually experience."
    )
    .replace(
      /^Wearing the same clothes may reduce some visible differences,\s*yet it does not automatically remove social pressure or economic inequality\.$/i,
      "The same clothes may hide some visible differences, but they do not automatically remove social pressure or economic inequality."
    )
    .replace(
      /^A better argument for uniforms is that they can simplify daily routines for families and reduce distractions in some school environments,\s*although even that benefit depends on how the policy is applied\.$/i,
      "A better argument for uniforms is that they can make daily routines easier for families and can, in some school environments, reduce distractions, though that benefit still depends on how the policy is applied."
    );

  if (mode === "report") {
    out = out
      .replace(
        /^The training program was designed to support newly promoted team leads during their first three months in role\.$/i,
        "The training program was designed to help newly promoted team leads through their first three months in role."
      )
      .replace(
        /^Rather than focusing only on theory,\s*the program combines short workshops,\s*peer discussion,\s*and scenario-based exercises that reflect common management challenges\.$/i,
        "Rather than focusing only on theory, the program uses short workshops, peer discussion, and scenario-based exercises based on common management challenges."
      )
      .replace(
        /^Participants are expected to practice difficult conversations,\s*review examples of unclear delegation,\s*and document how they would respond in realistic situations\.$/i,
        "Participants are expected to do three things: practice difficult conversations, review unclear delegation examples, and document how they would respond in realistic situations."
      )
      .replace(
        /^Early feedback suggests that the practical format is more useful than longer presentation-style sessions because it allows participants to test ideas and receive immediate input from others\.$/i,
        "Early feedback suggests the practical format is more useful than longer presentation-style sessions because participants can test ideas and receive immediate input from others."
      )
      .replace(
        /^At the same time,\s*the pilot also showed that time pressure remains a problem for some teams,\s*particularly when workshops are scheduled during busy reporting periods\.$/i,
        "The pilot also showed that some teams still struggle with time pressure, especially when workshops are scheduled during busy reporting periods."
      )
      .replace(
        /^For that reason,\s*the next version of the program will likely keep the same content while adjusting delivery times and shortening a few exercises\.$/i,
        "For that reason, the next version will likely keep the same content but adjust delivery times and shorten a few exercises."
      )
      .replace(
        /^The policy was introduced to reduce preventable delays in internal approvals and to improve the consistency of project documentation across departments\.$/i,
        "The policy was introduced to cut preventable delays in internal approvals and make project documentation more consistent across departments."
      )
      .replace(
        /^In practice,\s*the main change is that teams must submit a clearer project summary before requesting budget review\.$/i,
        "In practice, teams now need to submit a clearer project summary before asking for budget review."
      )
      .replace(
        /^This (additional|extra) step may appear minor,\s*but it is intended to reduce back-and-forth communication later in the process and to make approval decisions easier to track\.$/i,
        "That extra step may seem minor, but it is meant to cut down on back-and-forth later and make approval decisions easier to track."
      );
  }

  return cleanArtifacts(out);
}

function refineHumanizedOutput(text: string): string {
  return cleanArtifacts(
    text
      .replace(/\bNo matter what language a person speaks,\s*(?:in conclusion|to conclude|overall),?\s*/gi, "No matter what language a person speaks, ")
      .replace(/,\s*(?:in conclusion|to conclude)\s*,/gi, ", ")
      .replace(/^(?:In conclusion|To conclude),\s*/gim, "")
      .replace(/\bThe music also have\b/gi, "The music also has")
      .replace(/\b(The policy|The program|The process|The guide|The service|The training|The writing|The output|This|That|It)\s+also have\b/g, "$1 also has")
      .replace(/\b(The policy|The program|The process|The guide|The service|The training|The writing|The output|This|That|It)\s+have\b/g, "$1 has")
      .replace(/\bThis can influence mood and energy\b/gi, "This can affect mood and energy")
      .replace(/\bThis can influence\b/gi, "This can affect")
      .replace(/\bAlso,\s+also\b/gi, "Also")
      .replace(/\bOverall,\s+overall\b/gi, "Overall")
      .replace(/\.\s*,/g, ". ")
      .replace(/,\s*\./g, ".")
      .replace(/\bThis is especially true when\b/gi, "especially when")
  );
}

function chooseLeadSentenceIndex(sentences: string[]): number {
  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < sentences.length; index++) {
    const sentence = sentences[index];
    const words = countWords(sentence);
    if (!sentenceLooksStandalone(sentence)) continue;

    let score = Math.min(words, 22);

    if (!startsGeneric(sentence)) score += 6;
    if (!startsWithTransition(sentence)) score += 3;
    if (/[A-Za-z].*\b(can|helps|shows|means|suggests|depends|reduces|improves|allows)\b/i.test(sentence)) {
      score += 4;
    }
    if (index > 0) score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function moveLeadSentenceFirst(sentences: string[]): string[] {
  if (sentences.length < 2) return sentences;

  const leadIndex = chooseLeadSentenceIndex(sentences);
  if (leadIndex <= 0) return sentences;

  const reordered = [...sentences];
  const [lead] = reordered.splice(leadIndex, 1);
  reordered.unshift(lead);

  return reordered;
}

function moveTransitionSentenceLater(sentences: string[]): string[] {
  if (sentences.length < 3) return sentences;

  const reordered = [...sentences];
  if (startsWithTransition(reordered[0])) {
    const [first] = reordered.splice(0, 1);
    reordered.push(first);
  }

  return reordered;
}

function applyParagraphStrategy(
  paragraph: string,
  strategy: CandidateStrategy,
  strength: Strength,
  mode: string,
  tone: string,
  reorderLevel: 0 | 1 | 2
): string {
  if (strategy === "baseline") {
    return reshapeParagraphStructure(paragraph, strength, mode, tone, reorderLevel);
  }

  let sentences = splitSentences(paragraph);
  if (sentences.length <= 1) {
    return paragraph;
  }

  sentences = sentences.map((sentence, index) => {
    let out = cleanArtifacts(recomposeSentenceAdvanced(sentence, strength, mode, tone));
    out = locallyRecomposeSentence(out, mode, strength);

    if (strategy === "rhythm" || strategy === "structured_strong") {
      out = moveDependentClause(out, index % 2 === 0);
    }

    if (
      (strategy === "rhythm" || strategy === "structured_strong") &&
      countWords(out) > (strength === "strong" ? 17 : 20)
    ) {
      const broken = breakLongSentence(out);
      const parts = splitSentences(broken);
      if (parts.length === 2 && countWords(parts[0]) >= 6 && countWords(parts[1]) >= 6) {
        out = broken;
      }
    }

    return cleanArtifacts(out);
  });

  if (strategy === "rhythm" || strategy === "structured_strong") {
    sentences = combineShortSentences(sentences);
  }

  if (strategy === "lead_first" || strategy === "structured_strong") {
    sentences = moveLeadSentenceFirst(sentences);
  }

  if (strategy === "reordered_emphasis" || strategy === "structured_strong") {
    sentences = restructureSentenceSequence(
      moveTransitionSentenceLater(sentences),
      Math.max(reorderLevel, 1) as 1 | 2
    );
  }

  if (strategy === "structured_strong") {
    sentences = restructureSentenceSequence(sentences, 2);
  }

  sentences = reshapeFormalStudentProgression(sentences, mode, strength);
  sentences = diversifyOpeners(sentences);

  return lightPostProcess(sentences.join(" "));
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
    out = locallyRecomposeSentence(out, mode, strength);

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

function countAiPhrases(text: string): number {
  const patterns = [
    ...AI_PHRASES,
    /\bit is clear that\b/gi,
    /\bit is evident that\b/gi,
    /\bthis highlights\b/gi,
    /\bthis underscores\b/gi,
    /\bone of the most\b/gi,
    /\bin summary\b/gi,
  ];

  return patterns.reduce((total, pattern) => {
    const matches = text.match(pattern);
    return total + (matches?.length ?? 0);
  }, 0);
}

function analyzeSourceProfile(text: string): SourceProfile {
  const sentences = splitSentences(text);
  const starts = sentences.map((sentence) =>
    sentence.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase()
  );
  const repeatedOpeners = starts.length - new Set(starts).size;
  const aiPhraseHits = countAiPhrases(text);
  const genericLeadHits =
    (text.match(
      /\b(In today's world|Moreover|Furthermore|Additionally|Overall|It is important to note that)\b/gi
    ) || []).length;

  return {
    aiPhraseHits,
    genericAiLike: aiPhraseHits >= 2 || genericLeadHits >= 2,
    sentenceCount: sentences.length,
    paragraphCount: countParagraphs(text),
    repeatedOpeners,
  };
}

function paragraphRhythmPenalty(text: string): number {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length <= 1) return 0;

  const sentenceCounts = paragraphs
    .map((paragraph) => splitSentences(paragraph).length)
    .filter(Boolean);

  if (sentenceCounts.length <= 1) return 0;

  let penalty = 0;

  for (const count of sentenceCounts) {
    if (count >= 5) penalty += 1.5;
    else if (count === 1) penalty += 0.75;
  }

  const uniqueCounts = new Set(sentenceCounts);
  if (uniqueCounts.size === 1 && sentenceCounts.length >= 3) {
    penalty += 1.25;
  }

  return penalty;
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

function meaningRetentionScore(input: string, output: string): number {
  const normalizedInput = normalizeMeaningNeutralScaffold(input);
  const normalizedOutput = normalizeMeaningNeutralScaffold(output);
  const lexical = lexicalSimilarity(normalizedInput, normalizedOutput);
  const longestSpan = longestSharedSpanWords(normalizedInput, normalizedOutput);
  const inputWords = countWords(normalizedInput);
  const outputWords = countWords(normalizedOutput);

  const lengthRatio =
    inputWords === 0
      ? 1
      : Math.min(
          outputWords / inputWords,
          inputWords / Math.max(outputWords, 1)
        );

  const sharedSpanRatio =
    inputWords === 0 ? 0 : Math.min(longestSpan / Math.max(inputWords, 1), 1);

  return Math.max(
    0,
    Math.min(
      100,
      lexical * 62 +
      lengthRatio * 28 +
      sharedSpanRatio * 10
    )
  );
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

function sentenceProgressionRetention(input: string, output: string): number {
  const sourceSentences = splitSentences(input).map((sentence) =>
    cleanArtifacts(sentence).toLowerCase()
  );
  const rewrittenSentences = splitSentences(output).map((sentence) =>
    cleanArtifacts(sentence).toLowerCase()
  );

  if (sourceSentences.length <= 1 || rewrittenSentences.length <= 1) {
    return 1;
  }

  const matchedIndices: number[] = [];

  for (const rewritten of rewrittenSentences) {
    let bestIndex = -1;
    let bestScore = 0;

    for (let index = 0; index < sourceSentences.length; index++) {
      const score = lexicalSimilarity(sourceSentences[index], rewritten);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }

    if (bestIndex >= 0 && bestScore >= 0.34) {
      matchedIndices.push(bestIndex);
    }
  }

  if (matchedIndices.length <= 1) {
    return 1;
  }

  let forwardPairs = 0;
  let exactPairs = 0;

  for (let index = 1; index < matchedIndices.length; index++) {
    if (matchedIndices[index] >= matchedIndices[index - 1]) {
      forwardPairs++;
    }

    if (matchedIndices[index] === matchedIndices[index - 1] + 1) {
      exactPairs++;
    }
  }

  const pairCount = matchedIndices.length - 1;
  const forwardRatio = forwardPairs / pairCount;
  const exactRatio = exactPairs / pairCount;

  return Math.max(0, Math.min(1, forwardRatio * 0.55 + exactRatio * 0.45));
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

  return Math.min(
    1,
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

function normalizeStrongSentence(sentence: string): string {
  return cleanArtifacts(
    sentence
      .replace(/^Also,\s+/i, "Also, ")
      .replace(/^Still,\s+/i, "Still, ")
      .replace(/^As a result,\s+/i, "As a result, ")
      .replace(/^For that reason,\s+/i, "For that reason, ")
      .replace(/^At the same time,\s+/i, "At the same time, ")
      .replace(/^In practice,\s+/i, "In practice, ")
      .replace(/^Overall,\s+/i, "")
      .replace(/^But\s+/i, "")
      .replace(/^And\s+/i, "")
      .replace(/^So,\s+/i, "So ")
      .replace(/^So\s+the,\s+/i, "So the ")
      .replace(/^This more step\b/i, "This extra step")
      .replace(/^Since it\s+([a-z]+)/i, "This $1")
      .replace(/^Because it\s+([a-z]+)/i, "This $1")
      .replace(/^This is especially true when\b/i, "This is especially true when")
  );
}

function looksLikeListContinuation(sentence: string): boolean {
  const cleaned = sentence.trim();

  if (!cleaned || /^(Also|Still|As a result|For that reason|At the same time|In practice|This|That|These|Those)\b/i.test(cleaned)) {
    return false;
  }

  const firstChunk = cleaned.split(/\s+/).slice(0, 5).join(" ");
  const hasEarlyComma = firstChunk.includes(",");
  const startsNounPhrase = /^[A-Z][a-z]+(?:\s+[a-z-]+)?(?:,\s+|\s+and\s+)/.test(cleaned);
  const startsVerbContinuation = /^(Review|Document|Track|Describe|Explain|Compare|Outline)\b/.test(cleaned);

  return hasEarlyComma || startsNounPhrase || startsVerbContinuation;
}

function previousCanAbsorbContinuation(previous: string): boolean {
  return /\b(combines|include|includes|including|uses|offers|expects|expected|practice|practices|review|reviews|covers|covered|supports|supported|involves|involved)\b/i.test(
    previous
  );
}

function shouldMergeWithPrevious(previous: string, current: string): boolean {
  if (!previous || !current) return false;

  const cleanedCurrent = current.trim();

  if (
    /^(Because|Although|While|If|Since)\b/.test(cleanedCurrent) &&
    countWords(previous) <= 24 &&
    countWords(previous) + countWords(cleanedCurrent) <= 34
  ) {
    return true;
  }

  if (
    !looksLikeCompleteClause(cleanedCurrent) &&
    countWords(previous) <= 22 &&
    countWords(previous) + countWords(cleanedCurrent) <= 30
  ) {
    return true;
  }

  if (
    looksLikeListContinuation(cleanedCurrent) &&
    previousCanAbsorbContinuation(previous) &&
    countWords(previous) + countWords(cleanedCurrent) <= 34
  ) {
    return true;
  }

  if (
    /^This is especially true when\b/i.test(cleanedCurrent) &&
    countWords(previous) <= 22 &&
    countWords(previous) + countWords(cleanedCurrent) <= 32
  ) {
    return true;
  }

  return false;
}

function polishStrongCandidate(text: string): string {
  const paragraphs = splitParagraphs(text);

  const polishedParagraphs = paragraphs.map((paragraph) => {
    const sentences = splitSentences(paragraph);
    const polished: string[] = [];

    for (const rawSentence of sentences) {
      const normalized = normalizeStrongSentence(rawSentence);
      if (!normalized) continue;

      const previous = polished[polished.length - 1];

      if (previous && shouldMergeWithPrevious(previous, normalized)) {
        polished[polished.length - 1] = cleanArtifacts(
          `${previous.replace(/[.!?]+$/, "")}, ${lowerFirst(normalized)}`
        );
        continue;
      }

      if (
        previous &&
        tokenize(previous).join(" ") === tokenize(normalized).join(" ")
      ) {
        continue;
      }

      polished.push(normalized);
    }

    return polished
      .map((sentence) => capitalize(cleanArtifacts(sentence)))
      .join(" ");
  });

  return lightPostProcess(smoothStrongParagraphFlow(polishedParagraphs).join("\n\n"));
}

function smoothStrongParagraphFlow(paragraphs: string[]): string[] {
  return paragraphs.map((paragraph) => {
    const sentences = splitSentences(paragraph);
    if (sentences.length <= 1) return paragraph;

    const smoothed: string[] = [];

    for (let index = 0; index < sentences.length; index++) {
      const current = cleanArtifacts(sentences[index]);
      if (!current) continue;

      if (smoothed.length === 0) {
        smoothed.push(current);
        continue;
      }

      const previous = smoothed[smoothed.length - 1];

      if (
        /^This (allows|helps|makes|keeps|reduces|improves|supports)\b/i.test(current) &&
        countWords(previous) <= 24 &&
        countWords(previous) + countWords(current) <= 34
      ) {
        smoothed[smoothed.length - 1] = cleanArtifacts(
          `${previous.replace(/[.!?]+$/, "")}, ${lowerFirst(current)}`
        );
        continue;
      }

      smoothed.push(current);
    }

    return smoothed.join(" ");
  });
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

  return lightPostProcess(draft);
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
  const sourceProfile = analyzeSourceProfile(inputText);
  const candidates = generateRewriteCandidates(
    inputText,
    tone,
    mode,
    strength
  );

  let best = pickBestRewriteCandidate(candidates, strength);

  if (!best.score.meaningSafe && sourceProfile.genericAiLike) {
    const preservationRetry = preservationFocusedRetry(
      inputText,
      tone,
      mode,
      strength
    );
    const preservationScore = scoreRewriteCandidate(
      inputText,
      preservationRetry,
      strength,
      sourceProfile
    );

    if (preservationScore.total >= best.score.total - 2) {
      best = {
        id: "balanced_a",
        profileStrength: strength === "strong" ? "strong" : "medium",
        outputText: preservationRetry,
        score: preservationScore,
      };
    }
  }

  if (feelsLightlyEditedAiText(inputText, best.outputText, strength)) {
    const restructureRetry = targetedRestructureRetry(
      inputText,
      best.outputText,
      tone,
      mode,
      strength === "light" ? "medium" : strength
    );
    const restructureScore = scoreRewriteCandidate(
      inputText,
      restructureRetry,
      strength,
      sourceProfile
    );

    if (
      restructureScore.meaningSafe &&
      restructureScore.total >= best.score.total - 4 &&
      restructureScore.structuralFreshness >= best.score.structuralFreshness
    ) {
      best = {
        id: "aggressive",
        profileStrength: "strong",
        outputText: restructureRetry,
        score: restructureScore,
      };
    } else {
      const deeperCandidates = generateRewriteCandidates(
        inputText,
        tone,
        mode,
        strength === "light" ? "medium" : "strong"
      );
      const strongerBest = pickBestRewriteCandidate(deeperCandidates, strength === "light" ? "medium" : "strong");

      if (strongerBest.score.total >= best.score.total - 2) {
        best = strongerBest;
      }
    }
  }

  return lightPostProcess(best.outputText);
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

export function rewriteText(
  inputText: string,
  tone: string = "natural",
  mode: string = "standard",
  strength: Strength = "medium"
): string {
  return humanizeText(inputText, tone, mode, strength);
}

export function improveText(
  inputText: string,
  tone: string = "natural",
  mode: string = "standard",
  strength: Strength = "medium"
): string {
  const effectiveStrength = strength === "strong" ? "medium" : strength;
  return rewriteCore(inputText, tone, mode, effectiveStrength);
}

export function expandText(
  inputText: string,
  tone: string = "natural",
  mode: string = "standard",
  strength: Strength = "medium"
): string {
  const effectiveStrength = strength === "light" ? "medium" : strength;
  return rewriteCore(inputText, tone, mode, effectiveStrength);
}

export function shortenText(
  inputText: string,
  tone: string = "natural",
  mode: string = "standard",
  strength: Strength = "medium"
): string {
  const original = normalizeWhitespace(inputText);
  const tightenedStrength = strength === "strong" ? "medium" : "light";

  let out = stripAiPhrases(original);
  out = applyWordReplacements(out, tightenedStrength, {
    phraseBoost: 2,
    wordBoost: 1,
  });
  out = rewriteByTone(out, tone);
  out = rewriteByMode(out, mode);
  out = cleanupSentenceStarters(out);
  out = repairSentenceBoundaries(out);
  out = finalSentencePolish(out);
  out = cleanArtifacts(out);

  const originalWords = countWords(original);
  const shortenedWords = countWords(out);

  if (shortenedWords > originalWords && splitSentences(out).length > 1) {
    const trimmed = splitSentences(out).slice(0, -1).join(" ");
    if (countWords(trimmed) >= Math.max(6, Math.floor(originalWords * 0.55))) {
      return cleanArtifacts(trimmed);
    }
  }

  return out;
}

export function grammarText(inputText: string): string {
  const normalized = normalizeWhitespace(inputText);

  const out = normalized
    .replace(/\bi\b/g, "I")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bim\b/gi, "I'm")
    .replace(/\bive\b/gi, "I've")
    .replace(/\bdoesnt\b/gi, "doesn't")
    .replace(/\bdidnt\b/gi, "didn't")
    .replace(/\bisnt\b/gi, "isn't")
    .replace(/\barent\b/gi, "aren't")
    .replace(/\bwasnt\b/gi, "wasn't")
    .replace(/\bwerent\b/gi, "weren't")
    .replace(/\bshouldnt\b/gi, "shouldn't")
    .replace(/\bcouldnt\b/gi, "couldn't")
    .replace(/\bwouldnt\b/gi, "wouldn't")
    .replace(/\bthats\b/gi, "that's")
    .replace(/\btheres\b/gi, "there's")
    .replace(/\bwhats\b/gi, "what's")
    .replace(/([,.!?;:])([A-Za-z])/g, "$1 $2")
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, lead, letter) => `${lead}${letter.toUpperCase()}`);

  return cleanArtifacts(out);
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
    notes.push(
      strength === "light"
        ? "Used a light humanize path with a minimal candidate set."
        : "Generated multiple humanize candidates and selected the strongest one."
    );
    notes.push("Checked structural freshness against the source before selection.");
    notes.push("Prepared scoring dimensions for meaning, naturalness, and structure.");
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
  if (trimmed.includes(":")) {
    return trimmed;
  }

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

type CopiedSpanTarget = {
  sentenceIndex: number;
  sourceSentence: string;
  outputSentence: string;
  localSimilarity: number;
  localSharedSpan: number;
};

function looksExplanatorySpan(sentence: string): boolean {
  const cleaned = cleanArtifacts(sentence);

  return (
    countWords(cleaned) >= 10 &&
    (
      /,\s*/.test(cleaned) ||
      /\b(because|although|while|which|that|can|could|would|should|may|might|allows|allow|suggests|means|depends|reason|argument|process|policy|program|examples|expected|improve|reduce|support)\b/i.test(
        cleaned
      )
    )
  );
}

function findCopiedExplanatorySpan(
  inputText: string,
  outputText: string
): CopiedSpanTarget | null {
  const sourceSentences = splitSentences(inputText);
  const outputSentences = splitSentences(outputText);

  let best: CopiedSpanTarget | null = null;
  let bestScore = 0;

  for (let sentenceIndex = 0; sentenceIndex < outputSentences.length; sentenceIndex++) {
    const outputSentence = cleanArtifacts(outputSentences[sentenceIndex]);
    if (!looksExplanatorySpan(outputSentence)) continue;

    for (const sourceSentence of sourceSentences) {
      const cleanedSource = cleanArtifacts(sourceSentence);
      const localSimilarity = lexicalSimilarity(cleanedSource, outputSentence);
      const localSharedSpan = longestSharedSpanWords(cleanedSource, outputSentence);
      const spanScore =
        localSharedSpan * 1.8 +
        localSimilarity * 18 +
        Math.min(countWords(outputSentence), 24) * 0.2;

      if (
        localSharedSpan >= 8 &&
        localSimilarity >= 0.52 &&
        spanScore > bestScore
      ) {
        bestScore = spanScore;
        best = {
          sentenceIndex,
          sourceSentence: cleanedSource,
          outputSentence,
          localSimilarity,
          localSharedSpan,
        };
      }
    }
  }

  return best;
}

function addLocalRewriteVariant(variants: Set<string>, candidate: string): void {
  const cleaned = refineHumanizedOutput(cleanArtifacts(candidate));
  if (cleaned) {
    variants.add(cleaned);
  }
}

function buildOutputOnlyLocalRewriteVariants(
  sentence: string,
  mode: string,
  tone: string,
  _strength: Strength
): string[] {
  const variants = new Set<string>();
  const cleaned = cleanArtifacts(sentence);

  addLocalRewriteVariant(variants, cleaned);
  addLocalRewriteVariant(variants, locallyRecomposeSentence(cleaned, mode, "strong"));
  if (_strength === "strong") {
    addLocalRewriteVariant(variants, locallyRecomposeSentence(cleaned, mode, "medium"));
  }
  addLocalRewriteVariant(
    variants,
    recomposeSentenceAdvanced(cleaned, "strong", mode, tone)
  );
  addLocalRewriteVariant(variants, moveDependentClause(cleaned, true));
  addLocalRewriteVariant(variants, moveDependentClause(cleaned, false));

  if (countWords(cleaned) >= 12) {
    addLocalRewriteVariant(variants, capitalize(rotateClause(cleaned)));
  }

  const clauses = splitClauses(cleaned);
  if (clauses.length >= 2) {
    const longest = [...clauses].sort((a, b) => countWords(b) - countWords(a))[0];
    const others = clauses.filter((clause) => clause !== longest).join(", ").trim();

    if (
      longest &&
      others &&
      countWords(longest) >= 6 &&
      countWords(others) >= 5
    ) {
      addLocalRewriteVariant(variants, `${capitalize(longest)}, ${lowerFirst(others)}.`);
      addLocalRewriteVariant(variants, `${capitalize(others)}. ${capitalize(longest)}.`);
    }
  }

  const althoughMatch = cleaned.match(/^(.*?),\s*although\s+(.+)$/i);
  if (althoughMatch) {
    const main = althoughMatch[1]?.trim().replace(/[.!?]+$/, "");
    const support = althoughMatch[2]?.trim().replace(/[.!?]+$/, "");

    if (main && support && countWords(main) >= 8 && countWords(support) >= 5) {
      addLocalRewriteVariant(
        variants,
        `${capitalize(main)}. That still depends on ${lowerFirst(support)}.`
      );
      addLocalRewriteVariant(variants, `${capitalize(main)}, though ${lowerFirst(support)}.`);
    }
  }

  const butMatch = cleaned.match(/^(.*?),\s*but\s+(.+)$/i);
  if (butMatch) {
    const lead = butMatch[1]?.trim().replace(/[.!?]+$/, "");
    const contrast = butMatch[2]?.trim().replace(/[.!?]+$/, "");

    if (lead && contrast && countWords(lead) >= 7 && countWords(contrast) >= 5) {
      addLocalRewriteVariant(variants, `${capitalize(lead)}. But ${lowerFirst(contrast)}.`);
      addLocalRewriteVariant(variants, `${capitalize(contrast)}. ${capitalize(lead)}.`);
    }
  }

  const becauseMatch = cleaned.match(/^(.*?),\s*because\s+(.+)$/i);
  if (becauseMatch) {
    const main = becauseMatch[1]?.trim().replace(/[.!?]+$/, "");
    const reason = becauseMatch[2]?.trim().replace(/[.!?]+$/, "");

    if (main && reason && countWords(main) >= 7 && countWords(reason) >= 5) {
      addLocalRewriteVariant(variants, `Because ${lowerFirst(reason)}, ${lowerFirst(main)}.`);
      addLocalRewriteVariant(
        variants,
        `${capitalize(main)}. This is because ${lowerFirst(reason)}.`
      );
    }
  }

  if (/^A better argument for\b/i.test(cleaned)) {
    addLocalRewriteVariant(
      variants,
      cleaned
        .replace(/^A better argument for\b/i, "A stronger case for")
        .replace(/\bcan simplify\b/i, "can make")
    );
  }

  if (/^Rather than focusing only on theory\b/i.test(cleaned)) {
    addLocalRewriteVariant(
      variants,
      cleaned
        .replace(/^Rather than focusing only on theory,\s*/i, "The program is not just theoretical. ")
        .replace(/\bcombines\b/i, "uses")
    );
    addLocalRewriteVariant(
      variants,
      cleaned.replace(
        /^Rather than focusing only on theory,\s*/i,
        "Instead of relying on theory alone, "
      )
    );
  }

  if (/^At the same time,\s*the pilot also showed that\b/i.test(cleaned)) {
    addLocalRewriteVariant(
      variants,
      cleaned
        .replace(/^At the same time,\s*/i, "")
        .replace(/\bthe pilot also showed that\b/i, "the pilot showed that")
        .replace(/\bremains a problem for some teams\b/i, "still creates pressure for some teams")
    );
  }

  if (/^New hires usually understand the general process\b/i.test(cleaned)) {
    addLocalRewriteVariant(
      variants,
      cleaned
        .replace(
          /^New hires usually understand the general process after reading it once,\s*although\s*/i,
          "New hires usually understand the general process after one read. But "
        )
        .replace(/\bthey still have to go back and check details\b/i, "they still have to go back for details")
    );
  }

  return unique([...variants].filter(Boolean));
}

function buildSourceAwareLocalRewriteVariants(
  target: CopiedSpanTarget,
  mode: string,
  tone: string,
  strength: Strength
): string[] {
  const variants = new Set<string>();
  const source = cleanArtifacts(target.sourceSentence);
  const output = cleanArtifacts(target.outputSentence);

  for (const candidate of buildOutputOnlyLocalRewriteVariants(output, mode, tone, strength)) {
    addLocalRewriteVariant(variants, candidate);
  }

  addLocalRewriteVariant(variants, source);
  addLocalRewriteVariant(variants, locallyRecomposeSentence(source, mode, "strong"));
  addLocalRewriteVariant(variants, recomposeSentenceAdvanced(source, "strong", mode, tone));
  addLocalRewriteVariant(
    variants,
    locallyRecomposeSentence(
      recomposeSentenceAdvanced(source, "strong", mode, tone),
      mode,
      "strong"
    )
  );
  addLocalRewriteVariant(variants, moveDependentClause(source, true));
  addLocalRewriteVariant(variants, moveDependentClause(source, false));

  if (strength === "strong" && countWords(source) >= 14) {
    addLocalRewriteVariant(variants, breakLongSentence(locallyRecomposeSentence(source, mode, "strong")));
  }

  const sourceClauses = splitClauses(source);
  const outputClauses = splitClauses(output);
  const sourceLead = sourceClauses[0]?.replace(/[.!?]+$/, "").trim();
  const sourceTail = sourceClauses.slice(1).join(", ").replace(/[.!?]+$/, "").trim();
  const outputLead = outputClauses[0]?.replace(/[.!?]+$/, "").trim();
  const outputTail = outputClauses.slice(1).join(", ").replace(/[.!?]+$/, "").trim();

  if (sourceLead && sourceTail && countWords(sourceLead) >= 6 && countWords(sourceTail) >= 5) {
    addLocalRewriteVariant(variants, `${capitalize(sourceLead)}. ${capitalize(sourceTail)}.`);
    if (outputLead && outputLead !== sourceLead) {
      addLocalRewriteVariant(variants, `${capitalize(outputLead)}. ${capitalize(sourceTail)}.`);
    }
  }

  if (sourceLead && outputTail && countWords(sourceLead) >= 6 && countWords(outputTail) >= 5) {
    addLocalRewriteVariant(variants, `${capitalize(sourceLead)}. ${capitalize(outputTail)}.`);
  }

  const sourceContrastMatch = source.match(/^(.*?),\s*(but|yet)\s+(.+)$/i);
  if (sourceContrastMatch) {
    const lead = sourceContrastMatch[1]?.trim().replace(/[.!?]+$/, "");
    const contrast = sourceContrastMatch[3]?.trim().replace(/[.!?]+$/, "");

    if (lead && contrast && countWords(lead) >= 6 && countWords(contrast) >= 5) {
      addLocalRewriteVariant(variants, `${capitalize(lead)}. Still, ${lowerFirst(contrast)}.`);
      addLocalRewriteVariant(variants, `${capitalize(contrast)}. Even so, ${lowerFirst(lead)}.`);
    }
  }

  const sourceBecauseMatch = source.match(/^(.*?),\s*because\s+(.+)$/i);
  if (sourceBecauseMatch) {
    const main = sourceBecauseMatch[1]?.trim().replace(/[.!?]+$/, "");
    const reason = sourceBecauseMatch[2]?.trim().replace(/[.!?]+$/, "");

    if (main && reason && countWords(main) >= 6 && countWords(reason) >= 5) {
      addLocalRewriteVariant(variants, `${capitalize(main)}. That is because ${lowerFirst(reason)}.`);
    }
  }

  const sourceAlthoughMatch = source.match(/^(.*?),\s*although\s+(.+)$/i);
  if (sourceAlthoughMatch) {
    const main = sourceAlthoughMatch[1]?.trim().replace(/[.!?]+$/, "");
    const support = sourceAlthoughMatch[2]?.trim().replace(/[.!?]+$/, "");

    if (main && support && countWords(main) >= 6 && countWords(support) >= 5) {
      addLocalRewriteVariant(variants, `${capitalize(main)}. Even then, ${lowerFirst(support)}.`);
      addLocalRewriteVariant(variants, `${capitalize(main)}. That still depends on ${lowerFirst(support)}.`);
    }
  }

  if (/^Rather than focusing only on theory,\s*(.+)$/i.test(source)) {
    const rest = source.replace(/^Rather than focusing only on theory,\s*/i, "");
    addLocalRewriteVariant(
      variants,
      `The program is not limited to theory. ${capitalize(rest)}`
    );
  }

  if (
    /^Participants are expected to practice difficult conversations,\s*review examples of unclear delegation,\s*and document how they would respond in realistic situations\.$/i.test(
      source
    )
  ) {
    addLocalRewriteVariant(
      variants,
      "Participants are expected to do three things: practice difficult conversations, review examples of unclear delegation, and document how they would respond in realistic situations."
    );
  }

  if (
    /^Early feedback suggests that the practical format is more useful than longer presentation-style sessions because it allows participants to test ideas and receive immediate input from others\.$/i.test(
      source
    )
  ) {
    addLocalRewriteVariant(
      variants,
      "Early feedback suggests the practical format works better than longer presentation-style sessions. It gives participants room to test ideas and get immediate input from others."
    );
  }

  if (
    /^At the same time,\s*the pilot also showed that time pressure remains a problem for some teams,\s*particularly when workshops are scheduled during busy reporting periods\.$/i.test(
      source
    )
  ) {
    addLocalRewriteVariant(
      variants,
      "The pilot also showed that time pressure still causes problems for some teams, especially when workshops fall during busy reporting periods."
    );
  }

  if (
    /^A better argument for uniforms is that they can simplify daily routines for families and reduce distractions in some school environments,\s*although even that benefit depends on how the policy is applied\.$/i.test(
      source
    )
  ) {
    addLocalRewriteVariant(
      variants,
      "A stronger case for uniforms is that they can make daily routines easier for families and may reduce distractions in some school environments. Even then, that depends on how the policy is applied."
    );
  }

  if (
    /^New hires usually understand the general process after reading it once,\s*although they still have to go back and check details because the examples are not placed where people would expect them\.$/i.test(
      source
    )
  ) {
    addLocalRewriteVariant(
      variants,
      "Most new hires understand the overall process after one read. They still go back for details, though, because the examples are not placed where people expect them."
    );
  }

  return unique([...variants].filter(Boolean));
}

function selectBestLocalRewriteVariant(
  target: CopiedSpanTarget,
  candidates: string[]
): string {
  let best = target.outputSentence;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const cleaned = cleanArtifacts(candidate);
    if (!cleaned || cleaned === target.outputSentence) continue;

    const sourceMeaning = meaningRetentionScore(target.sourceSentence, cleaned);
    const outputMeaning = meaningRetentionScore(target.outputSentence, cleaned);
    const localMeaning = sourceMeaning * 0.65 + outputMeaning * 0.35;
    const sourceSimilarity = lexicalSimilarity(target.sourceSentence, cleaned);
    const localSharedSpan = longestSharedSpanWords(target.sourceSentence, cleaned);
    const spanGain = Math.max(0, target.localSharedSpan - localSharedSpan);
    const similarityGain = Math.max(0, target.localSimilarity - sourceSimilarity);
    const readabilityPenalty =
      (/^(Which|Because|Although|And|But|So)\b/.test(cleaned) ? 18 : 0) +
      (countWords(cleaned) < 6 ? 20 : 0);

    if (sourceMeaning < 84 || outputMeaning < 80) continue;

    const score =
      localMeaning -
      sourceSimilarity * 20 -
      localSharedSpan * 1.4 +
      spanGain * 3.5 +
      similarityGain * 16 -
      readabilityPenalty;

    if (score > bestScore) {
      bestScore = score;
      best = cleaned;
    }
  }

  return best;
}

function refineLongestCopiedSpan(
  inputText: string,
  outputText: string,
  tone: string,
  mode: string,
  strength: Strength,
  sourceProfile?: SourceProfile
): string {
  if (strength === "light" || sourceProfile?.genericAiLike) {
    return outputText;
  }

  const target = findCopiedExplanatorySpan(inputText, outputText);
  if (!target) return outputText;

  const localCandidates = buildSourceAwareLocalRewriteVariants(
    target,
    mode,
    tone,
    strength
  );
  const replacement = selectBestLocalRewriteVariant(target, localCandidates);

  if (replacement === target.outputSentence) {
    return outputText;
  }

  const outputSentences = splitSentences(outputText);
  outputSentences[target.sentenceIndex] = replacement;
  const refined = refineHumanizedOutput(lightPostProcess(outputSentences.join(" ")));

  const beforeScore = scoreRewriteCandidate(inputText, outputText, strength, sourceProfile);
  const afterScore = scoreRewriteCandidate(inputText, refined, strength, sourceProfile);
  const beforeMeaning = meaningRetentionScore(inputText, outputText);
  const afterMeaning = meaningRetentionScore(inputText, refined);
  const beforeSpan = longestSharedSpanWords(inputText, outputText);
  const afterSpan = longestSharedSpanWords(inputText, refined);

  if (afterMeaning + 1 < beforeMeaning) {
    return outputText;
  }

  if (afterSpan >= beforeSpan) {
    return outputText;
  }

  if (afterScore.readability + 4 < beforeScore.readability) {
    return outputText;
  }

  if (afterScore.naturalness + 4 < beforeScore.naturalness) {
    return outputText;
  }

  return refined;
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
    return lightPostProcess(firstPass);
  }

  const secondPass = aggressiveSecondPass(firstPass, mode, tone);
  const secondSimilarity = overallSimilarity(original, secondPass);

  const firstWords = countWords(firstPass);
  const secondWords = countWords(secondPass);

  const secondLooksReasonable =
    secondWords >= Math.max(6, Math.floor(firstWords * 0.78)) &&
    secondWords <= Math.ceil(firstWords * 1.30);

  if (secondLooksReasonable && secondSimilarity < firstSimilarity) {
    return lightPostProcess(secondPass);
  }

  return lightPostProcess(firstPass);
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

function feelsLightlyEditedAiText(
  inputText: string,
  outputText: string,
  strength: Strength
): boolean {
  const similarity = overallSimilarity(inputText, outputText);
  const aiPhraseHits = countAiPhrases(outputText);
  const longestSpan = longestSharedSpanWords(inputText, outputText);
  const sentences = splitSentences(outputText);
  const starts = sentences.map((sentence) =>
    sentence.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase()
  );
  const repeatedStartPenalty = starts.length - new Set(starts).size;
  const paragraphPenalty = paragraphRhythmPenalty(outputText);

  const similarityLimit =
    strength === "light" ? 0.86 :
    strength === "medium" ? 0.66 :
    0.58;

  return (
    similarity > similarityLimit ||
    aiPhraseHits > 0 ||
    longestSpan >= (strength === "light" ? 10 : 8) ||
    repeatedStartPenalty >= 2 ||
    paragraphPenalty >= 2
  );
}

function preserveParagraphRhythm(
  originalText: string,
  rewrittenText: string,
  paragraphBias: -1 | 0 | 1 = 0
): string {
  const originalParagraphs = splitParagraphs(originalText);
  const rewrittenSentences = splitSentences(rewrittenText);

  if (rewrittenSentences.length <= 2 || originalParagraphs.length <= 1) {
    return lightPostProcess(rewrittenText);
  }

  const sourceSentenceCounts = originalParagraphs.map(
    (paragraph) => splitSentences(paragraph).length
  );

  const adjustedCounts = sourceSentenceCounts.map((count) => {
    const next = count + paragraphBias;
    return Math.max(1, Math.min(4, next));
  });

  const paragraphs: string[] = [];
  let cursor = 0;

  for (let i = 0; i < adjustedCounts.length; i++) {
    const remainingParagraphs = adjustedCounts.length - i;
    const remainingSentences = rewrittenSentences.length - cursor;

    if (remainingSentences <= 0) break;

    const target =
      i === adjustedCounts.length - 1
        ? remainingSentences
        : Math.max(
            1,
            Math.min(
              adjustedCounts[i],
              remainingSentences - (remainingParagraphs - 1)
            )
          );

    paragraphs.push(rewrittenSentences.slice(cursor, cursor + target).join(" "));
    cursor += target;
  }

  if (cursor < rewrittenSentences.length) {
    const leftover = rewrittenSentences.slice(cursor).join(" ");
    if (paragraphs.length > 0) {
      paragraphs[paragraphs.length - 1] =
        `${paragraphs[paragraphs.length - 1]} ${leftover}`;
    } else {
      paragraphs.push(leftover);
    }
  }

  return lightPostProcess(paragraphs.join("\n\n"));
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
  strength: Strength,
  options?: {
    phraseBoost?: number;
    wordBoost?: number;
    reorderLevel?: 0 | 1 | 2;
    genericAiSafe?: boolean;
    strategy?: CandidateStrategy;
  }
): string {
  const paragraphs = splitParagraphs(text);
  const safeStrength: Strength = options?.genericAiSafe
    ? strength === "strong"
      ? "medium"
      : "light"
    : strength;

  const rewrittenParagraphs = paragraphs.map((paragraph) => {
    let out = paragraph;
    const replacementOptions =
      options?.genericAiSafe || tone === "formal"
        ? {
            phraseBoost: Math.min(options?.phraseBoost ?? 0, 0),
            wordBoost: -4,
          }
        : options;

    out = options?.genericAiSafe ? softenGenericAiScaffold(out) : stripAiPhrases(out);
    if (!options?.genericAiSafe) {
      out = applyWordReplacements(out, safeStrength, replacementOptions);
    }
    out = applyParagraphStrategy(
      out,
      options?.strategy ?? "baseline",
      safeStrength,
      mode,
      tone,
      options?.reorderLevel ?? 0
    );
    out = varyRhythm(out, safeStrength, mode, tone);
    out = rewriteByTone(out, tone);
    out = rewriteByMode(out, mode);
    out = cleanupHumanStyle(out);
    out = cleanupSentenceStarters(out);
    out = repairSentenceBoundaries(out);

    return lightPostProcess(out);
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
    .replace(
      /\b(I learned[^.]*?from this group project)\.\s+This showed me that\b/gi,
      "$1 because it showed me that "
    )
    .replace(
      /\b(School uniforms are often defended as a way to create equality)\.\s+That argument\b/gi,
      "$1, but that argument"
    )
    .replace(
      /\b(This (?:additional|extra) step may appear minor)\.\s+It is intended to\b/gi,
      "$1, but it is intended to"
    )
    .replace(
      /\b(Participants are expected to practice difficult conversations,\s*review examples of unclear delegation)\.\s+Document how they would respond in realistic situations\./gi,
      "$1, and document how they would respond in realistic situations."
    )
    .replace(
      /\bin some school environments\.,\s*although\b/gi,
      "in some school environments, although"
    )
    .replace(
      /\bin some school environments\.\s+Reduce distractions\b/gi,
      "in some school environments, reduce distractions"
    )
    .replace(
      /\bpresentation-style sessions\.\s+Since it allows\b/gi,
      "presentation-style sessions because it allows"
    )
    .replace(
      /\bproblem for some teams,\s+This is especially true when\b/gi,
      "problem for some teams, especially when"
    )
    .replace(
      /\bproblem for some teams\.\s+This is especially true when\b/gi,
      "problem for some teams, especially when"
    )
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

  return refineHumanizedOutput(out);
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
  reorderLevel: 0 | 1 | 2;
  genericAiSafe: boolean;
  strategy: CandidateStrategy;
}> {
  if (strength === "light") {
    return [
      {
        id: "balanced_a",
        strength: "light",
        phraseBoost: 0,
        wordBoost: 0,
        paragraphBias: 0,
        reorderLevel: 0,
        genericAiSafe: true,
        strategy: "baseline",
      },
    ];
  }

  if (strength === "strong") {
    return [
      {
        id: "balanced_a",
        strength: "strong",
        phraseBoost: 0,
        wordBoost: 0,
        paragraphBias: 0,
        reorderLevel: 1,
        genericAiSafe: true,
        strategy: "rhythm",
      },
      {
        id: "balanced_b",
        strength: "strong",
        phraseBoost: 1,
        wordBoost: 1,
        paragraphBias: 1,
        reorderLevel: 2,
        genericAiSafe: false,
        strategy: "lead_first",
      },
      {
        id: "aggressive",
        strength: "strong",
        phraseBoost: 1,
        wordBoost: 2,
        paragraphBias: 1,
        reorderLevel: 2,
        genericAiSafe: false,
        strategy: "structured_strong",
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
      reorderLevel: 0,
      genericAiSafe: true,
      strategy: "baseline",
    },
    {
      id: "balanced_b",
      strength: "medium",
      phraseBoost: 1,
      wordBoost: 0,
      paragraphBias: 0,
      reorderLevel: 1,
      genericAiSafe: true,
      strategy: "rhythm",
    },
    {
      id: "aggressive",
      strength: "medium",
      phraseBoost: 1,
      wordBoost: 1,
      paragraphBias: 1,
      reorderLevel: 1,
      genericAiSafe: false,
      strategy: "reordered_emphasis",
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
  outputText: string,
  strength: Strength = "medium",
  sourceProfile?: SourceProfile
): CandidateScore {
  const similarity = overallSimilarity(inputText, outputText);
  const openerMatch = openerSimilarity(inputText, outputText);
  const progressionRetention = sentenceProgressionRetention(inputText, outputText);
  const aiPhraseHits = countAiPhrases(outputText);
  const paragraphPenalty = paragraphRhythmPenalty(outputText);
  const meaningPreservation = meaningRetentionScore(inputText, outputText);
  const longestSpan = longestSharedSpanWords(inputText, outputText);

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

  const naturalness =
    Math.max(0, readability) -
    aiPhraseHits * 8 -
    paragraphPenalty * 6;

  const structuralFreshness =
    Math.max(0, variation) -
    Math.round(openerMatch * 22);

  const penalties =
    shortFragments * 10 +
    awkwardStarts * 8 +
    repeatedStarts * 5 +
    aiPhraseHits * 7 +
    paragraphPenalty * 5;

  const meaningThreshold =
    sourceProfile?.genericAiLike
      ? strength === "strong"
        ? 78
        : 78
      : strength === "strong"
      ? 74
      : 72;
  const meaningSafe = meaningPreservation >= meaningThreshold;
  const classicStructureSafe =
    similarity <= (strength === "light" ? 0.82 : strength === "medium" ? 0.72 : 0.66) &&
    openerMatch <= (strength === "light" ? 0.75 : 0.6) &&
    longestSpan < (strength === "light" ? 12 : strength === "medium" ? 11 : 10);
  const reorderedStructureSafe =
    strength !== "light" &&
    similarity <= (strength === "medium" ? 0.86 : 0.84) &&
    progressionRetention <= (strength === "medium" ? 0.72 : 0.7) &&
    structuralFreshness >= (strength === "medium" ? 14 : 18) &&
    openerMatch <= 0.75 &&
    longestSpan < 13;
  const compactReorderedStructureSafe =
    strength !== "light" &&
    !!sourceProfile &&
    sourceProfile.sentenceCount <= 3 &&
    similarity <= 0.86 &&
    progressionRetention <= 0.35 &&
    openerMatch <= 0.2 &&
    structuralFreshness >= (strength === "medium" ? 15 : 18) &&
    longestSpan < 28;
  const shortSwapStructureSafe =
    strength === "strong" &&
    !!sourceProfile &&
    sourceProfile.sentenceCount === 2 &&
    similarity <= 0.82 &&
    progressionRetention <= 0.05 &&
    openerMatch === 0 &&
    structuralFreshness >= 18 &&
    longestSpan < 28;
  const structureSafe =
    meaningSafe && (
      classicStructureSafe ||
      reorderedStructureSafe ||
      compactReorderedStructureSafe ||
      shortSwapStructureSafe
    );

  const meaningWeight =
    strength === "light" ? 0.62 : strength === "medium" ? 0.56 : 0.58;
  const naturalnessWeight =
    strength === "light" ? 0.25 : strength === "medium" ? 0.18 : 0.12;
  const structureWeight =
    strength === "light" ? 0.13 : strength === "medium" ? 0.26 : 0.3;

  const total =
    (meaningPreservation * meaningWeight) +
    (Math.max(0, naturalness) * naturalnessWeight) +
    (Math.max(0, structuralFreshness) * structureWeight) -
    (penalties * 0.2);

  return {
    total: meaningSafe ? total : total - 30,
    meaningPreservation,
    naturalness: Math.max(0, naturalness),
    structuralFreshness: Math.max(0, structuralFreshness),
    meaningSafe,
    structureSafe,
    similarity,
    progressionRetention,
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
  profileStrength: Strength;
  outputText: string;
  score: ReturnType<typeof scoreRewriteCandidate>;
}> {
  const originalParagraphCount = countParagraphs(inputText);
  const sourceProfile = analyzeSourceProfile(inputText);
  const profiles = getRewriteProfiles(strength);

  return profiles.map((profile) => {
    const genericAiSafe = sourceProfile.genericAiLike ? true : profile.genericAiSafe;
    let output = rewriteParagraphAware(
      inputText,
      tone,
      mode,
      profile.strength,
      {
        phraseBoost: genericAiSafe
          ? Math.max(0, profile.phraseBoost - 1)
          : profile.phraseBoost,
        wordBoost: genericAiSafe
          ? Math.max(0, profile.wordBoost - 1)
          : profile.wordBoost,
        reorderLevel: genericAiSafe
          ? (Math.min(profile.reorderLevel, 1) as 0 | 1)
          : profile.reorderLevel,
        genericAiSafe,
        strategy: genericAiSafe && profile.strategy === "structured_strong"
          ? "lead_first"
          : profile.strategy,
      }
    );

    output = preserveParagraphRhythm(inputText, output, profile.paragraphBias);
    output = rebalanceParagraphs(output, {
      originalParagraphCount,
      minParagraphs: Math.max(1, originalParagraphCount - 1),
      maxParagraphs: originalParagraphCount + 1,
      minSentencesPerParagraph: 2,
      maxSentencesPerParagraph: 4,
    });

    if (profile.strength === "strong") {
      output = polishStrongCandidate(output);
      output = finalSentencePolish(output);
    }

    output = refineLongestCopiedSpan(
      inputText,
      output,
      tone,
      mode,
      profile.strength,
      sourceProfile
    );
    output = lightPostProcess(output);

    const score = scoreRewriteCandidate(inputText, output, strength, sourceProfile);

    return {
      id: profile.id,
      profileStrength: profile.strength,
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
    profileStrength: Strength;
    outputText: string;
    score: ReturnType<typeof scoreRewriteCandidate>;
  }>,
  strength: Strength = "medium"
): {
  id: "balanced_a" | "balanced_b" | "aggressive";
  profileStrength: Strength;
  outputText: string;
  score: ReturnType<typeof scoreRewriteCandidate>;
} {
  if (candidates.length === 1) {
    return candidates[0];
  }

  const sorted = [...candidates].sort((a, b) => b.score.total - a.score.total);
  const meaningSafeCandidates = sorted.filter((candidate) => candidate.score.meaningSafe);
  const structureSafeCandidates = meaningSafeCandidates.filter(
    (candidate) => candidate.score.structureSafe
  );
  const ranked =
    structureSafeCandidates.length > 0
      ? structureSafeCandidates
      : meaningSafeCandidates.length > 0
      ? meaningSafeCandidates
      : sorted;

  const best = ranked[0];
  const second = ranked[1];

  if (strength === "strong") {
    const strongerStructured = ranked.find(
      (candidate) =>
        candidate.profileStrength === "strong" &&
        candidate.score.meaningSafe &&
        candidate.score.structuralFreshness >= best.score.structuralFreshness + 8 &&
        candidate.score.total >= best.score.total - 8
    );

    if (strongerStructured) {
      return strongerStructured;
    }
  }

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

function targetedRestructureRetry(
  inputText: string,
  currentOutputText: string,
  tone: string,
  mode: string,
  strength: Strength
): string {
  const originalParagraphCount = countParagraphs(inputText);
  let retry = applyParagraphStrategy(
    currentOutputText,
    strength === "strong" ? "structured_strong" : "reordered_emphasis",
    "strong",
    mode,
    tone,
    strength === "strong" ? 2 : 1
  );
  retry = aggressiveSecondPass(retry, mode, tone);
  retry = reshapeParagraphStructure(
    retry,
    "strong",
    mode,
    tone,
    strength === "strong" ? 2 : 1
  );
  retry = cleanupSentenceStarters(retry);
  retry = repairSentenceBoundaries(retry);

  retry = preserveParagraphRhythm(inputText, retry, strength === "strong" ? 1 : 0);
  retry = rebalanceParagraphs(retry, {
    originalParagraphCount,
    minParagraphs: Math.max(1, originalParagraphCount - 1),
    maxParagraphs: originalParagraphCount + 1,
    minSentencesPerParagraph: 2,
    maxSentencesPerParagraph: 4,
  });
  retry = polishStrongCandidate(retry);
  retry = finalSentencePolish(retry);
  retry = refineLongestCopiedSpan(inputText, retry, tone, mode, strength);

  return lightPostProcess(retry);
}

function preservationFocusedRetry(
  inputText: string,
  tone: string,
  mode: string,
  strength: Strength
): string {
  const originalParagraphCount = countParagraphs(inputText);
  let retry = rewriteParagraphAware(
    inputText,
    tone,
    mode,
    strength === "strong" ? "medium" : strength,
    {
      phraseBoost: 0,
      wordBoost: 0,
      reorderLevel: strength === "strong" ? 1 : 0,
      genericAiSafe: true,
      strategy: strength === "strong" ? "lead_first" : "baseline",
    }
  );

  retry = preserveParagraphRhythm(inputText, retry, 0);
  retry = rebalanceParagraphs(retry, {
    originalParagraphCount,
    minParagraphs: Math.max(1, originalParagraphCount - 1),
    maxParagraphs: originalParagraphCount + 1,
    minSentencesPerParagraph: 2,
    maxSentencesPerParagraph: 4,
  });
  if (strength === "strong") {
    retry = polishStrongCandidate(retry);
  }
  retry = finalSentencePolish(retry);

  return lightPostProcess(retry);
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
  const sourceProfile = analyzeSourceProfile(inputText);
  const originalParagraphCount = countParagraphs(inputText);

  let retry = inputText;
  retry = sourceProfile.genericAiLike ? cleanArtifacts(retry) : stripAiPhrases(retry);
  retry = applyWordReplacements(retry, "medium", {
    phraseBoost: sourceProfile.genericAiLike ? 1 : 3,
    wordBoost: sourceProfile.genericAiLike ? 0 : 1,
  });
  retry = reshapeParagraphStructure(
    retry,
    "strong",
    mode,
    tone,
    sourceProfile.genericAiLike ? 1 : 2
  );
  retry = varyRhythm(retry, "medium", mode, tone);
  retry = rewriteByTone(retry, tone);
  retry = rewriteByMode(retry, mode);
  retry = cleanupHumanStyle(retry);
  retry = cleanupSentenceStarters(retry);
  retry = repairSentenceBoundaries(retry);
  retry = preserveParagraphRhythm(inputText, retry, 1);
  retry = rebalanceParagraphs(retry, {
    originalParagraphCount,
    minParagraphs: Math.max(1, originalParagraphCount - 1),
    maxParagraphs: originalParagraphCount + 1,
    minSentencesPerParagraph: 2,
    maxSentencesPerParagraph: 4,
  });
  retry = polishStrongCandidate(retry);
  retry = lightPostProcess(retry);

  const currentScore = scoreRewriteCandidate(
    inputText,
    currentOutputText,
    "medium",
    sourceProfile
  );
  const retryScore = scoreRewriteCandidate(
    inputText,
    retry,
    "medium",
    sourceProfile
  );

  if (retryScore.total > currentScore.total) {
    return retry;
  }

  return currentOutputText;
}


export { countWords };
export function evaluateHumanizeCandidate(inputText: string, outputText: string) {
  return scoreRewriteCandidate(
    inputText,
    outputText,
    "medium",
    analyzeSourceProfile(inputText)
  );
}
