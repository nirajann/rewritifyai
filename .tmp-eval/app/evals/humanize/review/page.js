"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HumanizeReviewPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const defaultReviewerState = () => ({
    soundsNatural: false,
    preservesMeaning: false,
    tooSimilarToSource: false,
    awkwardGrammar: false,
    wouldPassAsHumanWritten: false,
    needsRewriteImprovement: false,
    notes: "",
});
const strengths = ["light", "medium", "strong"];
const storageKey = "rewritifyai-humanize-review-v1";
function HumanizeReviewPage() {
    var _a, _b;
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)("");
    const [selectedCaseId, setSelectedCaseId] = (0, react_1.useState)("");
    const [sourceFilter, setSourceFilter] = (0, react_1.useState)("all");
    const [reviewerNotes, setReviewerNotes] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                setReviewerNotes(JSON.parse(raw));
            }
        }
        catch (_a) {
            setReviewerNotes({});
        }
    }, []);
    (0, react_1.useEffect)(() => {
        if (Object.keys(reviewerNotes).length === 0)
            return;
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
            const payload = (await response.json());
            if (!response.ok) {
                throw new Error("message" in payload && payload.message
                    ? payload.message
                    : "Failed to run humanizer review.");
            }
            const nextData = payload;
            setData(nextData);
            setSelectedCaseId((current) => { var _a; return current || ((_a = nextData.cases[0]) === null || _a === void 0 ? void 0 : _a.id) || ""; });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to run humanizer review.");
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        void runReview();
    }, []);
    const visibleCases = (0, react_1.useMemo)(() => {
        if (!data)
            return [];
        return data.cases.filter((item) => sourceFilter === "all" ? true : item.source === sourceFilter);
    }, [data, sourceFilter]);
    (0, react_1.useEffect)(() => {
        if (!visibleCases.length)
            return;
        if (!visibleCases.some((item) => item.id === selectedCaseId)) {
            setSelectedCaseId(visibleCases[0].id);
        }
    }, [visibleCases, selectedCaseId]);
    const activeCase = (_a = visibleCases.find((item) => item.id === selectedCaseId)) !== null && _a !== void 0 ? _a : null;
    const updateReview = (key, updater) => {
        setReviewerNotes((current) => {
            var _a;
            return (Object.assign(Object.assign({}, current), { [key]: updater((_a = current[key]) !== null && _a !== void 0 ? _a : defaultReviewerState()) }));
        });
    };
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50 px-4 py-8 md:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-7xl space-y-6", children: [(0, jsx_runtime_1.jsxs)("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold uppercase tracking-wide text-emerald-700", children: "Internal Review" }), (0, jsx_runtime_1.jsx)("h1", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-950", children: "Humanizer Case Review" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 max-w-3xl text-sm leading-7 text-slate-600", children: "Review source text, rewritten output, heuristic signals, detector observations, and human judgment together. This page is for product improvement, not user-facing claims." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-3", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/evals/humanize", className: "rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: "Summary Eval" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => void runReview(), disabled: loading, className: "rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60", children: loading ? "Running..." : "Rerun Review Cases" })] })] }), data ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-5 grid gap-4 md:grid-cols-4", children: [(0, jsx_runtime_1.jsx)(InfoCard, { label: "Cases", value: `${data.caseCount}` }), (0, jsx_runtime_1.jsx)(InfoCard, { label: "Strengths", value: data.strengths.map((item) => item.toUpperCase()).join(" / ") }), (0, jsx_runtime_1.jsx)(InfoCard, { label: "Last run", value: new Date(data.generatedAt).toLocaleString() }), (0, jsx_runtime_1.jsx)(InfoCard, { label: "View", value: "Side-by-side review" })] })) : null, data ? ((0, jsx_runtime_1.jsx)("p", { className: "mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900", children: data.caveat })) : null, error ? ((0, jsx_runtime_1.jsx)("p", { className: "mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: error })) : null] }), (0, jsx_runtime_1.jsxs)("section", { className: "grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-bold text-slate-950", children: "Cases" }), (0, jsx_runtime_1.jsxs)("select", { value: sourceFilter, onChange: (event) => setSourceFilter(event.target.value), className: "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "All" }), (0, jsx_runtime_1.jsx)("option", { value: "benchmark", children: "Benchmark" }), (0, jsx_runtime_1.jsx)("option", { value: "internal-review", children: "Internal" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 space-y-3", children: visibleCases.map((item) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setSelectedCaseId(item.id), className: `w-full rounded-2xl border px-4 py-3 text-left ${item.id === selectedCaseId
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: item.title }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs text-slate-500", children: item.id })] }), (0, jsx_runtime_1.jsx)("span", { className: "rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600", children: item.source === "internal-review" ? "Internal" : "Bench" })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3 flex flex-wrap gap-2", children: item.tags.slice(0, 3).map((tag) => ((0, jsx_runtime_1.jsx)("span", { className: "rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600", children: tag }, `${item.id}-${tag}`))) })] }, item.id))) })] }), (0, jsx_runtime_1.jsx)("section", { className: "space-y-6", children: activeCase ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold uppercase tracking-wide text-slate-500", children: activeCase.source === "internal-review"
                                                                    ? "Internal Failure Sample"
                                                                    : "Benchmark Case" }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-2 text-2xl font-bold text-slate-950", children: activeCase.title }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-sm text-slate-600", children: ["Tone: ", (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-slate-900", children: activeCase.tone }), " · ", "Mode: ", (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-slate-900", children: activeCase.mode }), " · ", "Length: ", (0, jsx_runtime_1.jsx)("span", { className: "font-medium text-slate-900", children: activeCase.length })] })] }), activeCase.detectorObservation ? ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-semibold", children: "Detector result available" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1", children: [activeCase.detectorObservation.score, "% ", activeCase.detectorObservation.label] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-xs leading-6", children: activeCase.detectorObservation.note })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600", children: "Detector result is not attached for this case." }))] }), ((_b = activeCase.notes) === null || _b === void 0 ? void 0 : _b.length) ? ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4", children: activeCase.notes.map((note) => ((0, jsx_runtime_1.jsx)("p", { className: "text-sm leading-7 text-slate-700", children: note }, note))) })) : null, (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Source text" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs font-medium text-slate-500", children: [activeCase.inputWordCount, " words"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700", children: activeCase.inputText })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid gap-6 xl:grid-cols-3", children: activeCase.variants.map((variant) => {
                                            var _a;
                                            const reviewKey = `${activeCase.id}:${variant.strength}`;
                                            const review = (_a = reviewerNotes[reviewKey]) !== null && _a !== void 0 ? _a : defaultReviewerState();
                                            const disagreement = activeCase.detectorObservation &&
                                                activeCase.detectorObservation.score >= 80 &&
                                                review.wouldPassAsHumanWritten;
                                            return ((0, jsx_runtime_1.jsxs)("article", { className: "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: [variant.strength, " strength"] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-lg font-bold text-slate-950", children: variant.score.total.toFixed(1) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right text-xs text-slate-500", children: [(0, jsx_runtime_1.jsxs)("p", { children: [variant.outputWordCount, " words"] }), (0, jsx_runtime_1.jsx)("p", { children: variant.flags.length ? variant.flags.join(", ") : "No flags" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)(SignalPill, { label: "Meaning", value: variant.score.meaningPreservation }), (0, jsx_runtime_1.jsx)(SignalPill, { label: "Natural", value: variant.score.naturalness }), (0, jsx_runtime_1.jsx)(SignalPill, { label: "Structure", value: variant.score.structuralFreshness }), (0, jsx_runtime_1.jsx)(SignalPill, { label: "Similarity", value: variant.score.similarity * 100 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Rewritten output" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700", children: variant.outputText })] }), disagreement ? ((0, jsx_runtime_1.jsx)("p", { className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", children: "Human review and detector observation disagree here. Treat this as a real review discussion point, not a metric win." })) : null, (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Reviewer labels" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3 flex flex-wrap gap-2", children: reviewOptions.map((option) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => updateReview(reviewKey, (current) => (Object.assign(Object.assign({}, current), { [option.id]: !current[option.id] }))), className: `rounded-full px-3 py-2 text-xs font-semibold ${review[option.id]
                                                                        ? "bg-emerald-500 text-white"
                                                                        : "bg-white text-slate-700 ring-1 ring-slate-200"}`, children: option.label }, option.id))) }), (0, jsx_runtime_1.jsx)("textarea", { value: review.notes, onChange: (event) => updateReview(reviewKey, (current) => (Object.assign(Object.assign({}, current), { notes: event.target.value }))), placeholder: "Add case-specific review notes...", className: "mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400" })] })] }, reviewKey));
                                        }) })] })) : ((0, jsx_runtime_1.jsx)("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-600", children: "No review case selected." }) })) })] })] }) }));
}
const reviewOptions = [
    { id: "soundsNatural", label: "Sounds natural" },
    { id: "preservesMeaning", label: "Preserves meaning" },
    { id: "tooSimilarToSource", label: "Too similar to source" },
    { id: "awkwardGrammar", label: "Awkward grammar/coherence" },
    { id: "wouldPassAsHumanWritten", label: "Would pass as human-written" },
    { id: "needsRewriteImprovement", label: "Needs rewrite improvement" },
];
function InfoCard({ label, value }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: label }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm font-semibold text-slate-950", children: value })] }));
}
function SignalPill({ label, value }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white px-3 py-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-slate-500", children: label }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm font-bold text-slate-950", children: value.toFixed(1) })] }));
}
