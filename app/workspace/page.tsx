"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { exportTextAsDocx, exportTextAsPdf } from "@/lib/exporters";
import AnimatedDiffOutput from "@/components/AnimatedDiffOutput";

type ToolType =
  | "humanize"
  | "rewrite"
  | "paraphrase"
  | "improve"
  | "expand"
  | "shorten"
  | "grammar"
  | "detector"
  | "plagiarism";

type StoredUser = {
  id: string;
  email: string;
};

type ApiResponse = {
  success: boolean;
  tool?: string;
  outputText?: string;
  wordCount?: number;
  tone?: string;
  mode?: string;
  notes?: string[];
  humanScore?: number;
  message?: string;
  documentId?: string;
  code?: "auth_required" | "quota_exceeded";
  quota?: {
    plan: string;
    period: "day";
    limit: number;
    used: number;
    remaining: number;
    resetAt: string;
  };
};

type VersionItem = {
  id: string;
  version_number: number;
  input_text: string;
  output_text: string;
  tool: ToolType;
  tone: string;
  mode: string;
  word_count: number;
  human_score: number;
  created_at: string;
};

type LoadedDocumentResponse = {
  success: boolean;
  document?: {
    id: string;
    title: string;
    user_id?: string | null;
    input_text: string;
    output_text: string;
    tool: ToolType;
    tone: string;
    mode: string;
    word_count: number;
    human_score: number;
  };
  versions?: VersionItem[];
  message?: string;
};

const tools: { id: ToolType; title: string; premium?: boolean }[] = [
  { id: "humanize", title: "Humanize" },
  { id: "rewrite", title: "Rewrite" },
  { id: "paraphrase", title: "Paraphrase" },
  { id: "improve", title: "Improve" },
  { id: "expand", title: "Expand" },
  { id: "shorten", title: "Shorten" },
  { id: "grammar", title: "Grammar" },
  { id: "detector", title: "AI Detector", premium: true },
  { id: "plagiarism", title: "Plagiarism", premium: true },
];

const workingTools = [
  "humanize",
  "rewrite",
  "paraphrase",
  "improve",
  "expand",
  "shorten",
  "grammar",
] as const;

type WorkingTool = (typeof workingTools)[number];

export default function WorkspacePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [error, setError] = useState("");
  const [tone, setTone] = useState("natural");
  const [mode, setMode] = useState("standard");
  const [activeTool, setActiveTool] = useState<ToolType>("humanize");
  const [notes, setNotes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [helperOpen, setHelperOpen] = useState(false);
  const [helperMessage, setHelperMessage] = useState(
    "Choose a tool, paste your text, and refine it."
  );
  const [humanScoreState, setHumanScoreState] = useState(91);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [strength, setStrength] = useState<"light" | "medium" | "strong">("medium");
  const [isRetrying, setIsRetrying] = useState(false);

  const searchParams = useSearchParams();
  const urlDocumentId = searchParams.get("id");

  const formatQuotaReset = (resetAt?: string) => {
    if (!resetAt) return "later";

    const parsed = new Date(resetAt);
    if (Number.isNaN(parsed.getTime())) return "later";

    return parsed.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("rewritify_user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const inputWordCount = inputText.trim()
    ? inputText.trim().split(/\s+/).length
    : 0;

  const outputWordCount = outputText.trim()
    ? outputText.trim().split(/\s+/).length
    : 0;

  const clarityGain = useMemo(() => {
    if (!outputText) return "+0%";
    if (activeTool === "humanize") return "+14%";
    if (activeTool === "rewrite") return "+13%";
    if (activeTool === "paraphrase") return "+10%";
    if (activeTool === "improve") return "+18%";
    if (activeTool === "expand") return "+12%";
    if (activeTool === "shorten") return "+11%";
    if (activeTool === "grammar") return "+15%";
    return "+0%";
  }, [outputText, activeTool]);

  const isWorkingTool = (tool: ToolType): tool is WorkingTool => {
    return (workingTools as readonly string[]).includes(tool);
  };

  const loadDocument = async (docId: string) => {
    const res = await fetch(`/api/documents/${docId}`);
    const data: LoadedDocumentResponse = await res.json();

    if (!res.ok || !data.success || !data.document) {
      throw new Error(data.message || "Failed to load document");
    }

    const doc = data.document;

    setCurrentDocumentId(doc.id);
    setDocumentTitle(doc.title || "Untitled Document");
    setInputText(doc.input_text || "");
    setOutputText(doc.output_text || "");
    setTone(doc.tone || "natural");
    setMode(doc.mode || "standard");
    setActiveTool(doc.tool || "humanize");
    setHumanScoreState(doc.human_score || 0);
    setVersions(data.versions || []);
    setNotes([]);
  };

  useEffect(() => {
    async function initialLoad() {
      if (!urlDocumentId) return;

      try {
        setLoadingDocument(true);
        setError("");
        await loadDocument(urlDocumentId);
        setHelperMessage("Saved document loaded successfully.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        setLoadingDocument(false);
      }
    }

    initialLoad();
  }, [urlDocumentId]);

  const refreshVersions = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      const data: LoadedDocumentResponse = await res.json();

      if (res.ok && data.success) {
        setVersions(data.versions || []);
      }
    } catch {
      // ignore
    }
  };

  const handleTool = async (tool: WorkingTool) => {
    setActiveTool(tool);
    setLoading(true);
    setError("");
    setOutputText("");
    setNotes([]);
    setCopied(false);

    if (!inputText.trim()) {
      setError("Please enter some text first.");
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setError("Sign in to use rewrite tools during beta. Daily limits are tracked per account.");
      setHelperMessage("Sign in to start a tracked beta rewrite session.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/${tool}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText,
          tone,
          mode,
          strength,
          wordCount: inputWordCount,
          title: documentTitle,
          documentId: currentDocumentId,
          userId: user?.id ?? null,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        if (data.code === "quota_exceeded") {
          setHelperMessage(
            `Daily limit reached. Your access resets ${formatQuotaReset(data.quota?.resetAt)}.`
          );
        } else if (data.code === "auth_required") {
          setHelperMessage("Sign in to use tracked beta rewrites.");
        }

        throw new Error(data.message || "Something went wrong");
      }

      setOutputText(data.outputText || "");
      setNotes(data.notes || []);
      setHumanScoreState(data.humanScore || 0);

      if (data.documentId) {
        setCurrentDocumentId(data.documentId);
        await refreshVersions(data.documentId);
      }

      setHelperMessage(
        data.quota
          ? `Your text has been refined and saved. ${data.quota.remaining} rewrites remain today.`
          : "Your text has been refined and saved."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = async () => {
    if (!inputText.trim() || !outputText.trim()) return;

    if (!user?.id) {
      setError("Sign in to use rewrite tools during beta. Daily limits are tracked per account.");
      setHelperMessage("Sign in to generate another tracked variation.");
      return;
    }

    try {
      setIsRetrying(true);
      setError("");

      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          retry: true,
          inputText,
          currentOutputText: outputText,
          tone,
          mode,
          userId: user.id,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === "quota_exceeded") {
          setHelperMessage(
            `Daily limit reached. Your access resets ${formatQuotaReset(data.quota?.resetAt)}.`
          );
        } else if (data.code === "auth_required") {
          setHelperMessage("Sign in to use tracked beta rewrites.");
        }

        throw new Error(data.message || "Retry failed");
      }

      if (typeof data.outputText === "string" && data.outputText.trim()) {
        setOutputText(data.outputText);
        setHelperMessage(
          data.quota
            ? `Generated an alternate variation. ${data.quota.remaining} rewrites remain today.`
            : "Generated an alternate variation."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!currentDocumentId) return;

    try {
      setLoadingDocument(true);
      setError("");

      const res = await fetch(`/api/documents/${currentDocumentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "restoreVersion",
          versionId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to restore version");
      }

      await loadDocument(currentDocumentId);
      setHelperMessage("Older version restored successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore version");
    } finally {
      setLoadingDocument(false);
    }
  };

  const handlePreviewVersion = (version: VersionItem) => {
    setInputText(version.input_text || "");
    setOutputText(version.output_text || "");
    setTone(version.tone || "natural");
    setMode(version.mode || "standard");
    setActiveTool(version.tool || "humanize");
    setHumanScoreState(version.human_score || 0);
    setHelperMessage(`Previewing version ${version.version_number}.`);
  };

  const handlePremiumPlaceholder = (tool: "detector" | "plagiarism") => {
    setActiveTool(tool);
    setOutputText("");
    setNotes([]);
    setError("");
    setHumanScoreState(0);

    setHelperMessage(
      tool === "detector"
        ? "AI Detector is not live yet. The current tile is only a placeholder for a planned feature."
        : "Plagiarism Checker is not live yet. The current tile is only a placeholder for a planned feature."
    );
  };

  const handleCopy = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy text.");
    }
  };

  const handleClear = () => {
    setDocumentTitle("Untitled Document");
    setCurrentDocumentId(null);
    setVersions([]);
    setInputText("");
    setOutputText("");
    setError("");
    setNotes([]);
    setCopied(false);
    setActiveTool("humanize");
    setTone("natural");
    setMode("standard");
    setStrength("medium");
    setHumanScoreState(91);
    setHelperMessage("Editor cleared. Paste text or upload a DOCX file to begin.");
  };

  const handleExportPdf = async () => {
    if (!outputText) {
      setError("No output text to export.");
      return;
    }

    await exportTextAsPdf(outputText);
    setHelperMessage("Your output has been exported as PDF.");
  };

  const handleExportDocx = async () => {
    if (!outputText) {
      setError("No output text to export.");
      return;
    }

    await exportTextAsDocx(outputText);
    setHelperMessage("Your output has been exported as Word.");
  };

  const handleDocxUpload = async (file: File) => {
    try {
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-docx", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      setInputText(data.text || "");
      setHelperMessage("Document uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-5 md:px-6">
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-950">Workspace</h1>
              <p className="mt-1 text-sm text-slate-500">
                Focused writing tools with a cleaner editing flow. Beta rewrites
                are tracked per signed-in account.
              </p>

              <input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:max-w-md"
                placeholder="Document title"
              />
            </div>

            <div className="text-xs text-slate-400">
              {currentDocumentId ? "Saved document" : "Unsaved draft"}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:h-fit">
            <p className="mb-4 text-sm font-semibold text-slate-950">Tools</p>

            <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
              {tools.map((tool) => {
                const active = activeTool === tool.id;

                return (
                  <button
                    key={tool.id}
                    onClick={() =>
                      tool.id === "detector" || tool.id === "plagiarism"
                        ? handlePremiumPlaceholder(tool.id)
                        : setActiveTool(tool.id)
                    }
                    className={`flex shrink-0 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition xl:w-full ${
                      active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{tool.title}</span>
                    {tool.premium ? (
                      <span className="ml-3 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                        Pro
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[160px_160px_160px_140px_minmax(180px,1fr)]">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="natural">Natural</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Strength
                  </label>
                  <select
                    value={strength}
                    onChange={(e) =>
                      setStrength(e.target.value as "light" | "medium" | "strong")
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="school">School</option>
                    <option value="report">Report</option>
                    <option value="thesis">Thesis</option>
                    <option value="research">Research</option>
                    <option value="proposal">Proposal</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Words
                  </label>
                  <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
                    {inputWordCount} words
                  </div>
                </div>

                <div className="flex flex-col gap-2 xl:justify-end">
                  <button
                    onClick={() => isWorkingTool(activeTool) && handleTool(activeTool)}
                    disabled={loading || loadingDocument || !isWorkingTool(activeTool)}
                    className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {loadingDocument
                      ? "Loading..."
                      : loading
                      ? "Processing..."
                      : isWorkingTool(activeTool)
                      ? activeTool.charAt(0).toUpperCase() + activeTool.slice(1)
                      : "Premium Tool"}
                  </button>

                  <button
                    type="button"
                    onClick={handleTryAgain}
                    disabled={isRetrying || !outputText.trim()}
                    className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRetrying ? "Trying Again..." : "Try Again"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  onClick={handleClear}
                  type="button"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Clear
                </button>

                <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Upload DOCX
                  <input
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocxUpload(file);
                    }}
                  />
                </label>

                <button
                  onClick={handleExportPdf}
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Export PDF
                </button>

                <button
                  onClick={handleExportDocx}
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Export Word
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">Input</p>
                  <span className="text-xs text-slate-500">{inputWordCount} words</span>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.length > 0) {
                      setHelperMessage("Typing detected. Pick a tool to refine your text.");
                    }
                  }}
                  placeholder="Paste your text here..."
                  className="min-h-[320px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 lg:min-h-[620px]"
                />
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950">Output</p>
                  <span className="text-xs text-emerald-700">{outputWordCount} words</span>
                </div>

                {activeTool === "detector" ? (
                  <div className="min-h-[320px] rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-7 text-slate-700 lg:min-h-[620px]">
                    <p className="text-lg font-semibold text-slate-950">AI Detector</p>
                    <p className="mt-3">
                      This feature is not live yet. The current tile is only a
                      placeholder for a planned detector.
                    </p>
                  </div>
                ) : activeTool === "plagiarism" ? (
                  <div className="min-h-[320px] rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-7 text-slate-700 lg:min-h-[620px]">
                    <p className="text-lg font-semibold text-slate-950">Plagiarism Checker</p>
                    <p className="mt-3">
                      This feature is not live yet. The current tile is only a
                      placeholder for a planned originality checker.
                    </p>
                  </div>
                ) : (
                  <div className="min-h-[320px] lg:min-h-[620px]">
                    <AnimatedDiffOutput
                      inputText={inputText}
                      outputText={outputText}
                      isLoading={loading || loadingDocument}
                    />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950">Insights</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-emerald-500 bg-white">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-950">{humanScoreState}%</p>
                    <p className="text-xs font-medium text-emerald-700">
                      Human score estimate
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                    <span className="text-sm text-slate-500">Tone</span>
                    <span className="text-sm font-semibold text-slate-950 capitalize">{tone}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                    <span className="text-sm text-slate-500">Mode</span>
                    <span className="text-sm font-semibold text-slate-950 capitalize">{mode}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                    <span className="text-sm text-slate-500">
                      Estimated clarity gain
                    </span>
                    <span className="text-sm font-semibold text-emerald-700">{clarityGain}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Versions</p>

              {versions.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {versions.map((version) => (
                    <li
                      key={version.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      <div>
                        <div className="font-semibold text-slate-950">
                          Version {version.version_number}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(version.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handlePreviewVersion(version)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Restore
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No saved versions yet.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Processing Notes</p>

              {notes.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {notes.map((note, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      • {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Notes will appear after processing.
                </div>
              )}
            </div>
          </aside>
        </div>

        <button
          onClick={() => setHelperOpen((prev) => !prev)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600 sm:bottom-6 sm:right-6 sm:px-5"
        >
          AI Helper
        </button>

        {helperOpen && (
          <div className="fixed bottom-20 right-3 z-50 w-[calc(100vw-24px)] max-w-[320px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:bottom-24 sm:right-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">AI Helper</p>
                <p className="text-xs text-slate-500">Placeholder assistant</p>
              </div>
              <button
                onClick={() => setHelperOpen(false)}
                className="rounded-full px-2 py-1 text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {helperMessage}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
