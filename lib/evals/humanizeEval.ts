import {
  countWords,
  evaluateHumanizeCandidate,
  humanizeText,
  type Strength,
} from "@/lib/textTools";
import {
  HUMANIZE_BENCHMARK,
  HUMANIZE_BENCHMARK_VERSION,
  type HumanizeBenchmarkCase,
} from "@/lib/evals/humanizeBenchmark";

type EvalCaseResult = {
  id: string;
  title: string;
  category: HumanizeBenchmarkCase["category"];
  length: HumanizeBenchmarkCase["length"];
  tone: HumanizeBenchmarkCase["tone"];
  mode: HumanizeBenchmarkCase["mode"];
  inputWordCount: number;
  outputWordCount: number;
  outputText: string;
  score: ReturnType<typeof evaluateHumanizeCandidate>;
  flags: string[];
};

type EvalStrengthSummary = {
  strength: Strength;
  averageTotal: number;
  averageMeaningPreservation: number;
  averageNaturalness: number;
  averageStructuralFreshness: number;
  averageSimilarity: number;
  averagePenalties: number;
  meaningSafeRate: number;
  structureSafeRate: number;
  flaggedCases: string[];
};

type EvalStrengthRun = {
  strength: Strength;
  summary: EvalStrengthSummary;
  cases: EvalCaseResult[];
};

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildFlags(score: ReturnType<typeof evaluateHumanizeCandidate>) {
  const flags: string[] = [];

  if (!score.meaningSafe) {
    flags.push("meaning-risk");
  }

  if (!score.structureSafe) {
    flags.push("too-close-to-source");
  }

  if (score.naturalness < 60) {
    flags.push("flat-naturalness");
  }

  if (score.structuralFreshness < 12) {
    flags.push("weak-restructure");
  }

  if (score.penalties >= 18) {
    flags.push("cleanup-penalties");
  }

  return flags;
}

function summarizeStrengthRun(
  strength: Strength,
  cases: EvalCaseResult[],
): EvalStrengthSummary {
  return {
    strength,
    averageTotal: round(average(cases.map((item) => item.score.total))),
    averageMeaningPreservation: round(
      average(cases.map((item) => item.score.meaningPreservation)),
    ),
    averageNaturalness: round(
      average(cases.map((item) => item.score.naturalness)),
    ),
    averageStructuralFreshness: round(
      average(cases.map((item) => item.score.structuralFreshness)),
    ),
    averageSimilarity: round(
      average(cases.map((item) => item.score.similarity)),
    ),
    averagePenalties: round(
      average(cases.map((item) => item.score.penalties)),
    ),
    meaningSafeRate: round(
      (cases.filter((item) => item.score.meaningSafe).length / cases.length) * 100,
    ),
    structureSafeRate: round(
      (cases.filter((item) => item.score.structureSafe).length / cases.length) * 100,
    ),
    flaggedCases: cases
      .filter((item) => item.flags.length > 0)
      .map((item) => item.id),
  };
}

function runSingleCase(
  benchmarkCase: HumanizeBenchmarkCase,
  strength: Strength,
): EvalCaseResult {
  const outputText = humanizeText(
    benchmarkCase.inputText,
    benchmarkCase.tone,
    benchmarkCase.mode,
    strength,
  );
  const score = evaluateHumanizeCandidate(benchmarkCase.inputText, outputText);

  return {
    id: benchmarkCase.id,
    title: benchmarkCase.title,
    category: benchmarkCase.category,
    length: benchmarkCase.length,
    tone: benchmarkCase.tone,
    mode: benchmarkCase.mode,
    inputWordCount: countWords(benchmarkCase.inputText),
    outputWordCount: countWords(outputText),
    outputText,
    score,
    flags: buildFlags(score),
  };
}

export function runHumanizeBenchmark(
  strengths: Strength[] = ["light", "medium", "strong"],
): {
  generatedAt: string;
  benchmarkVersion: string;
  caveat: string;
  caseCount: number;
  runs: EvalStrengthRun[];
} {
  const runs = strengths.map((strength) => {
    const cases = HUMANIZE_BENCHMARK.map((benchmarkCase) =>
      runSingleCase(benchmarkCase, strength),
    );

    return {
      strength,
      summary: summarizeStrengthRun(strength, cases),
      cases,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    benchmarkVersion: HUMANIZE_BENCHMARK_VERSION,
    caveat:
      "These scores are heuristic and useful for product iteration, not scientific proof of human quality or detector resistance.",
    caseCount: HUMANIZE_BENCHMARK.length,
    runs,
  };
}
