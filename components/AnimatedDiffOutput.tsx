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

function buildWordDiff(inputText: string, outputText: string): WordItem[] {
  const inputWords = inputText.trim().split(/\s+/);
  const outputWords = outputText.trim().split(/\s+/);

  return outputWords.map((word, index) => {
    const originalWord = inputWords[index] || "";
    return {
      word,
      changed: word !== originalWord,
    };
  });
}

export default function AnimatedDiffOutput({
  inputText,
  outputText,
  isLoading = false,
}: AnimatedDiffOutputProps) {
  const [visibleCount, setVisibleCount] = useState(0);

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
        return prev + 1;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [outputText, diffWords.length]);

  if (isLoading) {
    return (
      <div className="min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Analyzing tone...</p>
          <p className="text-sm font-medium text-slate-500">Rewriting structure...</p>
          <p className="text-sm font-medium text-slate-500">Polishing output...</p>
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
    <div className="min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5 text-sm leading-8 text-slate-900 whitespace-pre-wrap">
      {diffWords.slice(0, visibleCount).map((item, index) => (
        <span
          key={`${item.word}-${index}`}
          className={
            item.changed
              ? "rounded-md bg-emerald-100 px-1 py-0.5 text-emerald-800"
              : ""
          }
        >
          {item.word}{" "}
        </span>
      ))}
    </div>
  );
}