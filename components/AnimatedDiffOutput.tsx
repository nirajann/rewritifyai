"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedDiffOutputProps = {
  inputText: string;
  outputText: string;
  isLoading?: boolean;
};

type WordItem = {
  word: string;
  changed: boolean;
};

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^\w']/g, "");
}

function tokenizeWithSpacing(text: string): string[] {
  return text.match(/\S+\s*/g) || [];
}

function buildWordFrequencyMap(text: string) {
  const map = new Map<string, number>();
  const words = text.match(/\S+/g) || [];

  for (const word of words) {
    const normalized = normalizeWord(word);
    if (!normalized) continue;
    map.set(normalized, (map.get(normalized) || 0) + 1);
  }

  return map;
}

function buildWordDiff(inputText: string, outputText: string): WordItem[] {
  const inputFreq = buildWordFrequencyMap(inputText);
  const outputTokens = tokenizeWithSpacing(outputText);

  return outputTokens.map((token) => {
    const normalized = normalizeWord(token);

    if (!normalized) {
      return { word: token, changed: false };
    }

    const remaining = inputFreq.get(normalized) || 0;

    if (remaining > 0) {
      inputFreq.set(normalized, remaining - 1);
      return { word: token, changed: false };
    }

    return { word: token, changed: true };
  });
}

export default function AnimatedDiffOutput({
  inputText,
  outputText,
  isLoading = false,
}: AnimatedDiffOutputProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showHighlights, setShowHighlights] = useState(false);

  const diffWords = useMemo(() => {
    if (!outputText.trim()) return [];
    return buildWordDiff(inputText, outputText);
  }, [inputText, outputText]);

  useEffect(() => {
    setVisibleCount(0);

    if (!outputText.trim()) return;

    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= diffWords.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [outputText, diffWords.length]);

  if (isLoading) {
    return (
      <div className="min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5">
        <div className="space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-52 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!outputText.trim()) {
    return (
      <div className="min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5 text-sm leading-7 text-slate-500 whitespace-pre-wrap">
        Your refined output will appear here...
      </div>
    );
  }

  return (
    <div className="min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Refined Output</p>

        <button
          type="button"
          onClick={() => setShowHighlights((prev) => !prev)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            showHighlights
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {showHighlights ? "Hide Changes" : "Highlight Changes"}
        </button>
      </div>

      <div className="text-[15px] leading-8 text-slate-900 whitespace-pre-wrap">
        {diffWords.slice(0, visibleCount).map((item, index) => (
          <span
            key={`${item.word}-${index}`}
            className={
              showHighlights && item.changed
                ? "rounded-md bg-emerald-100 px-1 py-0.5 text-emerald-800"
                : ""
            }
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  );
}