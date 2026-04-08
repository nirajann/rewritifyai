import {
  HUMANIZE_BENCHMARK,
  type HumanizeBenchmarkCase,
} from "@/lib/evals/humanizeBenchmark";

export type HumanizeReviewCase = {
  id: string;
  title: string;
  category: HumanizeBenchmarkCase["category"] | "internal-failure";
  length: HumanizeBenchmarkCase["length"];
  tone: HumanizeBenchmarkCase["tone"];
  mode: HumanizeBenchmarkCase["mode"];
  inputText: string;
  source: "benchmark" | "internal-review";
  tags: string[];
  notes?: string[];
  detectorObservation?: {
    provider: "manual-observation";
    label: string;
    score: number;
    note: string;
  };
};

const BENCHMARK_REVIEW_CASES: HumanizeReviewCase[] = HUMANIZE_BENCHMARK.map(
  (item) => ({
    ...item,
    source: "benchmark",
    tags: [item.category, item.length],
  }),
);

const INTERNAL_FAILURE_CASES: HumanizeReviewCase[] = [
  {
    id: "music_failure_sample",
    title: "Music Passage Failure",
    category: "internal-failure",
    length: "short",
    tone: "natural",
    mode: "standard",
    source: "internal-review",
    tags: ["failure-sample", "music", "detector-high"],
    inputText:
      "The cafe was nice and the service was fast, but the music was too loud, which made it hard to talk normally. Because of that, the experience had some good parts, but it never felt fully relaxing.",
    notes: [
      "Recent internal failure sample used to review carryover, rhythm, and cleanup quality.",
      "Useful for spotting detector disagreement against human judgment.",
    ],
    detectorObservation: {
      provider: "manual-observation",
      label: "AI/GPT",
      score: 95.4,
      note: "Observed on a recent internal detector check for a failed rewrite sample.",
    },
  },
  {
    id: "music_mood_failure",
    title: "Music Mood Failure",
    category: "internal-failure",
    length: "short",
    tone: "natural",
    mode: "standard",
    source: "internal-review",
    tags: ["failure-sample", "grammar", "coherence"],
    inputText:
      "Music in public spaces can affect how people feel and how long they stay. Loud, fast music can raise energy, while slower music can create a calmer mood.",
    notes: [
      "Used to catch awkward joins like bad agreement or machine-clean explanatory phrasing.",
    ],
  },
];

export const HUMANIZE_REVIEW_CASES: HumanizeReviewCase[] = [
  ...BENCHMARK_REVIEW_CASES,
  ...INTERNAL_FAILURE_CASES,
];

