"use client";

import { useState } from "react";

type ApiResponse = {
  success: boolean;
  tool?: string;
  outputText?: string;
  wordCount?: number;
  tone?: string;
  mode?: string;
  notes?: string[];
  message?: string;
};

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tone, setTone] = useState("natural");
  const [mode, setMode] = useState("standard");

  const handleHumanize = async () => {
    setLoading(true);
    setError("");
    setOutputText("");

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText,
          tone,
          mode,
          wordCount: inputText.trim()
            ? inputText.trim().split(/\s+/).length
            : 0,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      setOutputText(data.outputText || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">RewritifyAI</h1>
        <p className="mt-2 text-gray-600">
          Clean AI writing MVP — Humanize your text.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Input Text
            </label>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              className="min-h-[250px] w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="natural">Natural</option>
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="standard">Standard</option>
                  <option value="school">School</option>
                  <option value="report">Report</option>
                  <option value="thesis">Thesis</option>
                  <option value="research">Research</option>
                  <option value="proposal">Proposal</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleHumanize}
              disabled={loading}
              className="mt-4 rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Humanize"}
            </button>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Output
            </label>

            <div className="min-h-[250px] rounded-xl border border-gray-300 bg-gray-50 p-4 text-gray-800 whitespace-pre-wrap">
              {outputText || "Your processed text will appear here..."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}