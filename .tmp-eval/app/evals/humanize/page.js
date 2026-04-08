"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HumanizeEvalPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const strengths = [
    "light",
    "medium",
    "strong",
];
function HumanizeEvalPage() {
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)("");
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
            const payload = (await response.json());
            if (!response.ok) {
                throw new Error("message" in payload && payload.message
                    ? payload.message
                    : "Failed to run humanize eval.");
            }
            setData(payload);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to run humanize eval.");
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        void runEval();
    }, []);
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50 px-4 py-8 md:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-7xl space-y-6", children: [(0, jsx_runtime_1.jsxs)("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold uppercase tracking-wide text-emerald-700", children: "Internal Eval" }), (0, jsx_runtime_1.jsx)("h1", { className: "mt-2 text-3xl font-bold tracking-tight text-slate-950", children: "Humanizer Benchmark" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 max-w-3xl text-sm leading-7 text-slate-600", children: "Repeatable benchmark runs for short, medium, and long passages. This harness is useful for product iteration, but the scores are still heuristic and should not be treated as scientific proof." })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => void runEval(), disabled: loading, className: "rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60", children: loading ? "Running..." : "Run Eval Again" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/evals/humanize/review", className: "rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: "Open Review Workflow" })] }), data ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-5 grid gap-4 md:grid-cols-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Benchmark version" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm font-semibold text-slate-950", children: data.benchmarkVersion })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Cases" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-sm font-semibold text-slate-950", children: [data.caseCount, " passages"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Last run" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm font-semibold text-slate-950", children: new Date(data.generatedAt).toLocaleString() })] })] })) : null, data ? ((0, jsx_runtime_1.jsx)("p", { className: "mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900", children: data.caveat })) : null, error ? ((0, jsx_runtime_1.jsx)("p", { className: "mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: error })) : null] }), data === null || data === void 0 ? void 0 : data.runs.map((run) => ((0, jsx_runtime_1.jsxs)("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 md:flex-row md:items-end md:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-2xl font-bold text-slate-950 capitalize", children: [run.strength, " strength"] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-slate-500", children: "Compare meaning retention, naturalness, and structural change across the current benchmark set." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-slate-500", children: ["Flagged cases: ", run.summary.flaggedCases.length] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6", children: [(0, jsx_runtime_1.jsx)(MetricCard, { label: "Avg total", value: run.summary.averageTotal }), (0, jsx_runtime_1.jsx)(MetricCard, { label: "Meaning", value: run.summary.averageMeaningPreservation }), (0, jsx_runtime_1.jsx)(MetricCard, { label: "Naturalness", value: run.summary.averageNaturalness }), (0, jsx_runtime_1.jsx)(MetricCard, { label: "Structure", value: run.summary.averageStructuralFreshness }), (0, jsx_runtime_1.jsx)(MetricCard, { label: "Meaning safe", value: `${run.summary.meaningSafeRate}%` }), (0, jsx_runtime_1.jsx)(MetricCard, { label: "Structure safe", value: `${run.summary.structureSafeRate}%` })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full border-separate border-spacing-0", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)(TableHead, { children: "Case" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Category" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Length" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Total" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Meaning" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Naturalness" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Structure" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Flags" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: run.cases.map((item) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsxs)(TableCell, { children: [(0, jsx_runtime_1.jsx)("div", { className: "font-semibold text-slate-950", children: item.title }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1 text-xs text-slate-500", children: item.id })] }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.category }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.length }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.score.total.toFixed(1) }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.score.meaningPreservation.toFixed(1) }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.score.naturalness.toFixed(1) }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.score.structuralFreshness.toFixed(1) }), (0, jsx_runtime_1.jsx)(TableCell, { children: item.flags.length > 0 ? item.flags.join(", ") : "None" })] }, `${run.strength}-${item.id}`))) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 grid gap-4 xl:grid-cols-2", children: run.cases.map((item) => ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: item.title }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-xs text-slate-500", children: [item.inputWordCount, " to ", item.outputWordCount, " words"] })] }), (0, jsx_runtime_1.jsx)("span", { className: "rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700", children: item.score.total.toFixed(1) })] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3 text-sm leading-7 text-slate-700", children: item.outputText })] }, `${run.strength}-${item.id}-preview`))) })] }, run.strength)))] }) }));
}
function MetricCard({ label, value, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: label }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-lg font-bold text-slate-950", children: value })] }));
}
function TableHead({ children }) {
    return ((0, jsx_runtime_1.jsx)("th", { className: "border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", children: children }));
}
function TableCell({ children }) {
    return ((0, jsx_runtime_1.jsx)("td", { className: "border-b border-slate-100 px-4 py-3 align-top text-sm text-slate-700", children: children }));
}
