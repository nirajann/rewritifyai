"use client";

import { useMemo, useState } from "react";
import {
  replacementLibrary,
  type ReplacementCategory,
} from "@/lib/replacementLibrary";

const categories: Array<ReplacementCategory | "all"> = [
  "all",
  "general",
  "connector",
  "academic",
  "technical",
  "workplace",
  "formal",
  "natural",
  "sop",
  "letter",
];

export default function ReplacementsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReplacementCategory | "all">("all");
  const [strength, setStrength] = useState<"all" | "light" | "medium" | "strong">("all");

  const filtered = useMemo(() => {
    return replacementLibrary.filter((item) => {
      const matchesSearch =
        item.from.toLowerCase().includes(search.toLowerCase()) ||
        item.to.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ? true : item.category === category;

      const matchesStrength =
        strength === "all" ? true : item.strength === strength;

      return matchesSearch && matchesCategory && matchesStrength;
    });
  }, [search, category, strength]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">Replacement Library</h1>
          <p className="mt-2 text-slate-600">
            Manage phrase replacements, connector rewrites, and meaning-preserving alternatives.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phrase, replacement, or notes..."
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ReplacementCategory | "all")
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All Categories" : item}
                </option>
              ))}
            </select>

            <select
              value={strength}
              onChange={(e) =>
                setStrength(e.target.value as "all" | "light" | "medium" | "strong")
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All Strengths</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="strong">Strong</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.category}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {item.strength}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Original
                  </p>
                  <p className="mt-2 text-sm text-slate-900">{item.from || "—"}</p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Replacement
                  </p>
                  <p className="mt-2 text-sm text-slate-900">{item.to || "Remove phrase"}</p>
                </div>
              </div>

              {item.notes ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{item.notes}</p>
                </div>
              ) : null}
            </div>
          ))}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No replacements found.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}