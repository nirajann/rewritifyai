import {
  countWords,
  evaluateHumanizeCandidate,
  humanizeText,
  type Strength,
} from "@/lib/textTools";
import {
  HUMANIZE_REVIEW_CASES,
  type HumanizeReviewCase,
} from "@/lib/evals/humanizeReviewCases";

type ReviewVariant = {
  strength: Strength;
  outputText: string;
  outputWordCount: number;
  score: ReturnType<typeof evaluateHumanizeCandidate>;
  flags: string[];
};

export type HumanizeReviewCaseRun = {
  id: string;
  title: string;
  category: HumanizeReviewCase["category"];
  length: HumanizeReviewCase["length"];
  tone: HumanizeReviewCase["tone"];
  mode: HumanizeReviewCase["mode"];
  source: HumanizeReviewCase["source"];
  tags: string[];
  notes?: string[];
  detectorObservation?: HumanizeReviewCase["detectorObservation"];
  inputText: string;
  inputWordCount: number;
  variants: ReviewVariant[];
};

function buildFlags(score: ReturnType<typeof evaluateHumanizeCandidate>) {
  const flags: string[] = [];

  if (!score.meaningSafe) {
    flags.push("meaning-risk");
  }

  if (!score.structureSafe) {
    flags.push("too-close-to-source");
  }

  if (score.naturalness < 70) {
    flags.push("rough-style");
  }

  if (score.structuralFreshness < 12) {
    flags.push("weak-restructure");
  }

  if (score.penalties >= 18) {
    flags.push("cleanup-penalties");
  }

  return flags;
}

function runCaseVariant(
  reviewCase: HumanizeReviewCase,
  strength: Strength,
): ReviewVariant {
  const outputText = humanizeText(
    reviewCase.inputText,
    reviewCase.tone,
    reviewCase.mode,
    strength,
  );
  const score = evaluateHumanizeCandidate(reviewCase.inputText, outputText);

  return {
    strength,
    outputText,
    outputWordCount: countWords(outputText),
    score,
    flags: buildFlags(score),
  };
}

function normalizeStrengths(value?: Strength[]): Strength[] {
  if (!value || value.length === 0) {
    return ["light", "medium", "strong"];
  }

  const unique = [...new Set(value)].filter(
    (item): item is Strength =>
      item === "light" || item === "medium" || item === "strong",
  );

  return unique.length > 0 ? unique : ["light", "medium", "strong"];
}

export function runHumanizeReview(strengths?: Strength[]) {
  const normalizedStrengths = normalizeStrengths(strengths);

  const cases: HumanizeReviewCaseRun[] = HUMANIZE_REVIEW_CASES.map((reviewCase) => ({
    id: reviewCase.id,
    title: reviewCase.title,
    category: reviewCase.category,
    length: reviewCase.length,
    tone: reviewCase.tone,
    mode: reviewCase.mode,
    source: reviewCase.source,
    tags: reviewCase.tags,
    notes: reviewCase.notes,
    detectorObservation: reviewCase.detectorObservation,
    inputText: reviewCase.inputText,
    inputWordCount: countWords(reviewCase.inputText),
    variants: normalizedStrengths.map((strength) =>
      runCaseVariant(reviewCase, strength),
    ),
  }));

  return {
    generatedAt: new Date().toISOString(),
    caveat:
      "This internal review view combines heuristic signals with side-by-side examples. Use it to support judgment, not to replace human review.",
    strengths: normalizedStrengths,
    caseCount: cases.length,
    cases,
  };
}

