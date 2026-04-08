"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Strength = "light" | "medium" | "strong";

type ReviewScore = {
  total: number;
  meaningPreservation: number;
  naturalness: number;
  structuralFreshness: number;
  similarity: number;
  progressionRetention: number;
  meaningSafe: boolean;
  structureSafe: boolean;
};

type ReviewVariant = {
  strength: Strength;
  outputText: string;
  outputWordCount: number;
  score: ReviewScore;
  flags: string[];
};

type ReviewCase = {
  id: string;
  title: string;
  category: string;
  length: string;
  tone: string;
  mode: string;
  source: "benchmark" | "internal-review";
  tags: string[];
  notes?: string[];
  detectorObservation?: {
    provider: "manual-observation";
    label: string;
    score: number;
    note: string;
  };
  inputText: string;
  inputWordCount: number;
  variants: ReviewVariant[];
};

type ReviewResponse = {
  generatedAt: string;
  caveat: string;
  strengths: Strength[];
  caseCount: number;
  cases: ReviewCase[];
};

type ReviewerState = {
  soundsNatural: boolean;
  preservesMeaning: boolean;
  tooSimilarToSource: boolean;
  awkwardGrammar: boolean;
  wouldPassAsHumanWritten: boolean;
  needsRewriteImprovement: boolean;
  notes: string;
};

const defaultReviewerState = (): ReviewerState => ({
  soundsNatural: false,
  preservesMeaning: false,
  tooSimilarToSource: false,
  awkwardGrammar: false,
  wouldPassAsHumanWritten: false,
  needsRewriteImprovement: false,
  notes: "",
});

const strengths: Strength[] = ["light", "medium", "strong"];
const storageKey = "rewritifyai-humanize-review-v1";

export default function HumanizeReviewPage() {
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "benchmark" | "internal-review">("all");
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, ReviewerState>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setReviewerNotes(JSON.parse(raw) as Record<string, ReviewerState>);
      }
    } catch {
      setReviewerNotes({});
    }
  }, []);

  useEffect(() => {
    if (Object.keys(reviewerNotes).length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(reviewerNotes));
  }, [reviewerNotes]);

  const runReview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/evals/humanize/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ strengths }),
      });

      const payload = (await response.json()) as ReviewResponse | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Failed to run humanizer review.",
        );
      }

      const nextData = payload as ReviewResponse;
      setData(nextData);
      setSelectedCaseId((current) => current || nextData.cases[0]?.id || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run humanizer review.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runReview();
  }, []);

  const visibleCases = useMemo(() => {
    if (!data) return [];

    return data.cases.filter((item) =>
      sourceFilter === "all" ? true : item.source === sourceFilter,
    );
  }, [data, sourceFilter]);

  useEffect(() => {
    if (!visibleCases.length) return;
    if (!visibleCases.some((item) => item.id === selectedCaseId)) {
      setSelectedCaseId(visibleCases[0].id);
    }
  }, [visibleCases, selectedCaseId]);

  const activeCase = visibleCases.find((item) => item.id === selectedCaseId) ?? null;

  const updateReview = (
    key: string,
    updater: (current: ReviewerState) => ReviewerState,
  ) => {
    setReviewerNotes((current) => ({
      ...current,
      [key]: updater(current[key] ?? defaultReviewerState()),
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Internal Review
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Humanizer Case Review
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Review source text, rewritten output, heuristic signals, detector
                observations, and human judgment together. This page is for product
                improvement, not user-facing claims.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/evals/humanize"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Summary Eval
              </Link>
              <button
                type="button"
                onClick={() => void runReview()}
                disabled={loading}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {loading ? "Running..." : "Rerun Review Cases"}
              </button>
            </div>
          </div>

          {data ? (
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <InfoCard label="Cases" value={`${data.caseCount}`} />
              <InfoCard
                label="Strengths"
                value={data.strengths.map((item) => item.toUpperCase()).join(" / ")}
              />
              <InfoCard
                label="Last run"
                value={new Date(data.generatedAt).toLocaleString()}
              />
              <InfoCard
                label="View"
                value="Side-by-side review"
              />
            </div>
          ) : null}

          {data ? (
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
              {data.caveat}
            </p>
          ) : null}

          {error ? (
            <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">Cases</h2>
              <select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(
                    event.target.value as "all" | "benchmark" | "internal-review",
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="all">All</option>
                <option value="benchmark">Benchmark</option>
                <option value="internal-review">Internal</option>
              </select>
            </div>

            <div className="mt-4 space-y-3">
              {visibleCases.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    item.id === selectedCaseId
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{item.id}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {item.source === "internal-review" ? "Internal" : "Bench"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={`${item.id}-${tag}`}
                        className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            {activeCase ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {activeCase.source === "internal-review"
                          ? "Internal Failure Sample"
                          : "Benchmark Case"}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-950">
                        {activeCase.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        Tone: <span className="font-medium text-slate-900">{activeCase.tone}</span>
                        {" · "}
                        Mode: <span className="font-medium text-slate-900">{activeCase.mode}</span>
                        {" · "}
                        Length: <span className="font-medium text-slate-900">{activeCase.length}</span>
                      </p>
                    </div>

                    {activeCase.detectorObservation ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                        <p className="font-semibold">
                          Detector result available
                        </p>
                        <p className="mt-1">
                          {activeCase.detectorObservation.score}% {activeCase.detectorObservation.label}
                        </p>
                        <p className="mt-1 text-xs leading-6">
                          {activeCase.detectorObservation.note}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Detector result is not attached for this case.
                      </div>
                    )}
                  </div>

                  {activeCase.notes?.length ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {activeCase.notes.map((note) => (
                        <p key={note} className="text-sm leading-7 text-slate-700">
                          {note}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">Source text</p>
                      <span className="text-xs font-medium text-slate-500">
                        {activeCase.inputWordCount} words
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {activeCase.inputText}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  {activeCase.variants.map((variant) => {
                    const reviewKey = `${activeCase.id}:${variant.strength}`;
                    const review = reviewerNotes[reviewKey] ?? defaultReviewerState();
                    const disagreement =
                      activeCase.detectorObservation &&
                      activeCase.detectorObservation.score >= 80 &&
                      review.wouldPassAsHumanWritten;

                    return (
                      <article
                        key={reviewKey}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {variant.strength} strength
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-950">
                              {variant.score.total.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>{variant.outputWordCount} words</p>
                            <p>{variant.flags.length ? variant.flags.join(", ") : "No flags"}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <SignalPill label="Meaning" value={variant.score.meaningPreservation} />
                          <SignalPill label="Natural" value={variant.score.naturalness} />
                          <SignalPill label="Structure" value={variant.score.structuralFreshness} />
                          <SignalPill label="Similarity" value={variant.score.similarity * 100} />
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-950">
                            Rewritten output
                          </p>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {variant.outputText}
                          </p>
                        </div>

                        {disagreement ? (
                          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Human review and detector observation disagree here. Treat this as a real review discussion point, not a metric win.
                          </p>
                        ) : null}

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-950">
                            Reviewer labels
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {reviewOptions.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  updateReview(reviewKey, (current) => ({
                                    ...current,
                                    [option.id]: !current[option.id],
                                  }))
                                }
                                className={`rounded-full px-3 py-2 text-xs font-semibold ${
                                  review[option.id]
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={review.notes}
                            onChange={(event) =>
                              updateReview(reviewKey, (current) => ({
                                ...current,
                                notes: event.target.value,
                              }))
                            }
                            placeholder="Add case-specific review notes..."
                            className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            ) : (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">
                  No review case selected.
                </p>
              </section>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

const reviewOptions: Array<{
  id: keyof Omit<ReviewerState, "notes">;
  label: string;
}> = [
  { id: "soundsNatural", label: "Sounds natural" },
  { id: "preservesMeaning", label: "Preserves meaning" },
  { id: "tooSimilarToSource", label: "Too similar to source" },
  { id: "awkwardGrammar", label: "Awkward grammar/coherence" },
  { id: "wouldPassAsHumanWritten", label: "Would pass as human-written" },
  { id: "needsRewriteImprovement", label: "Needs rewrite improvement" },
];

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SignalPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">
        {value.toFixed(1)}
      </p>
    </div>
  );
}

