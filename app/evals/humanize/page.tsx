"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EvalCaseResult = {
  id: string;
  title: string;
  category: string;
  length: string;
  flags: string[];
  score: {
    total: number;
    meaningPreservation: number;
    naturalness: number;
    structuralFreshness: number;
    similarity: number;
    meaningSafe: boolean;
    structureSafe: boolean;
  };
  outputText: string;
};

type EvalRun = {
  strength: "light" | "medium" | "strong";
  summary: {
    averageTotal: number;
    averageMeaningPreservation: number;
    averageNaturalness: number;
    averageStructuralFreshness: number;
    meaningSafeRate: number;
    structureSafeRate: number;
    flaggedCases: string[];
  };
  cases: EvalCaseResult[];
};

type EvalResponse = {
  generatedAt: string;
  benchmarkVersion: string;
  caveat: string;
  caseCount: number;
  runs: EvalRun[];
};

const strengths: Array<"light" | "medium" | "strong"> = [
  "light",
  "medium",
  "strong",
];

export default function HumanizeEvalPage() {
  const [data, setData] = useState<EvalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runEval = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/evals/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ strengths }),
      });

      const payload = (await response.json()) as EvalResponse | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in payload && payload.message
            ? payload.message
            : "Failed to run humanize eval.",
        );
      }

      setData(payload as EvalResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run humanize eval.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runEval();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Internal Eval
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Humanizer Benchmark
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Repeatable benchmark runs for short, medium, and long passages.
                This harness is useful for product iteration, but the scores are
                still heuristic and should not be treated as scientific proof.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void runEval()}
              disabled={loading}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? "Running..." : "Run Eval Again"}
            </button>
            <Link
              href="/evals/humanize/review"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open Review Workflow
            </Link>
          </div>

          {data ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Benchmark version
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {data.benchmarkVersion}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cases
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {data.caseCount} passages
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last run
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {new Date(data.generatedAt).toLocaleString()}
                </p>
              </div>
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

        {data?.runs.map((run) => (
          <section
            key={run.strength}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950 capitalize">
                  {run.strength} strength
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Compare meaning retention, naturalness, and structural change
                  across the current benchmark set.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Flagged cases: {run.summary.flaggedCases.length}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard label="Avg total" value={run.summary.averageTotal} />
              <MetricCard
                label="Meaning"
                value={run.summary.averageMeaningPreservation}
              />
              <MetricCard
                label="Naturalness"
                value={run.summary.averageNaturalness}
              />
              <MetricCard
                label="Structure"
                value={run.summary.averageStructuralFreshness}
              />
              <MetricCard
                label="Meaning safe"
                value={`${run.summary.meaningSafeRate}%`}
              />
              <MetricCard
                label="Structure safe"
                value={`${run.summary.structureSafeRate}%`}
              />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <TableHead>Case</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Length</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Meaning</TableHead>
                    <TableHead>Naturalness</TableHead>
                    <TableHead>Structure</TableHead>
                    <TableHead>Flags</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {run.cases.map((item) => (
                    <tr key={`${run.strength}-${item.id}`}>
                      <TableCell>
                        <div className="font-semibold text-slate-950">{item.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.id}</div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.length}</TableCell>
                      <TableCell>{item.score.total.toFixed(1)}</TableCell>
                      <TableCell>{item.score.meaningPreservation.toFixed(1)}</TableCell>
                      <TableCell>{item.score.naturalness.toFixed(1)}</TableCell>
                      <TableCell>{item.score.structuralFreshness.toFixed(1)}</TableCell>
                      <TableCell>
                        {item.flags.length > 0 ? item.flags.join(", ") : "None"}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {run.cases.map((item) => (
                <div
                  key={`${run.strength}-${item.id}-preview`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.inputWordCount} to {item.outputWordCount} words
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.score.total.toFixed(1)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {item.outputText}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-slate-100 px-4 py-3 align-top text-sm text-slate-700">
      {children}
    </td>
  );
}
