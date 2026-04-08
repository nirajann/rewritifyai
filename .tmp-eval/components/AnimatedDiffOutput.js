"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnimatedDiffOutput;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function normalizeWord(word) {
    return word.toLowerCase().replace(/[^\w']/g, "");
}
function tokenizeWithSpacing(text) {
    return text.match(/\S+\s*/g) || [];
}
function buildWordFrequencyMap(text) {
    const map = new Map();
    const words = text.match(/\S+/g) || [];
    for (const word of words) {
        const normalized = normalizeWord(word);
        if (!normalized)
            continue;
        map.set(normalized, (map.get(normalized) || 0) + 1);
    }
    return map;
}
function buildWordDiff(inputText, outputText) {
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
function AnimatedDiffOutput({ inputText, outputText, isLoading = false, }) {
    const [visibleCount, setVisibleCount] = (0, react_1.useState)(0);
    const [showHighlights, setShowHighlights] = (0, react_1.useState)(false);
    const diffWords = (0, react_1.useMemo)(() => {
        if (!outputText.trim())
            return [];
        return buildWordDiff(inputText, outputText);
    }, [inputText, outputText]);
    (0, react_1.useEffect)(() => {
        setVisibleCount(0);
        if (!outputText.trim())
            return;
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
        return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 w-40 animate-pulse rounded bg-slate-200" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 w-52 animate-pulse rounded bg-slate-200" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 w-44 animate-pulse rounded bg-slate-200" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 space-y-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 w-full animate-pulse rounded bg-slate-100" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 w-11/12 animate-pulse rounded bg-slate-100" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 w-10/12 animate-pulse rounded bg-slate-100" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 w-9/12 animate-pulse rounded bg-slate-100" })] })] }));
    }
    if (!outputText.trim()) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5 text-sm leading-7 text-slate-500 whitespace-pre-wrap", children: "Your refined output will appear here..." }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-[560px] rounded-2xl border border-emerald-200 bg-white p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4 flex items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-900", children: "Refined Output" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowHighlights((prev) => !prev), className: `rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${showHighlights
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`, children: showHighlights ? "Hide Changes" : "Highlight Changes" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-[15px] leading-8 text-slate-900 whitespace-pre-wrap", children: diffWords.slice(0, visibleCount).map((item, index) => ((0, jsx_runtime_1.jsx)("span", { className: showHighlights && item.changed
                        ? "rounded-md bg-emerald-100 px-1 py-0.5 text-emerald-800"
                        : "", children: item.word }, `${item.word}-${index}`))) })] }));
}
