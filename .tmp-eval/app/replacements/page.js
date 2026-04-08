"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReplacementsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const replacementLibrary_1 = require("@/lib/replacementLibrary");
const categories = [
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
function ReplacementsPage() {
    const [search, setSearch] = (0, react_1.useState)("");
    const [category, setCategory] = (0, react_1.useState)("all");
    const [strength, setStrength] = (0, react_1.useState)("all");
    const filtered = (0, react_1.useMemo)(() => {
        return replacementLibrary_1.replacementLibrary.filter((item) => {
            const matchesSearch = item.from.toLowerCase().includes(search.toLowerCase()) ||
                item.to.toLowerCase().includes(search.toLowerCase()) ||
                (item.notes || "").toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === "all" ? true : item.category === category;
            const matchesStrength = strength === "all" ? true : item.strength === strength;
            return matchesSearch && matchesCategory && matchesStrength;
        });
    }, [search, category, strength]);
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-7xl px-4 py-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-slate-950", children: "Replacement Library" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-slate-600", children: "Manage phrase replacements, connector rewrites, and meaning-preserving alternatives." }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 grid gap-3 md:grid-cols-3", children: [(0, jsx_runtime_1.jsx)("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search phrase, replacement, or notes...", className: "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" }), (0, jsx_runtime_1.jsx)("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500", children: categories.map((item) => ((0, jsx_runtime_1.jsx)("option", { value: item, children: item === "all" ? "All Categories" : item }, item))) }), (0, jsx_runtime_1.jsxs)("select", { value: strength, onChange: (e) => setStrength(e.target.value), className: "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "All Strengths" }), (0, jsx_runtime_1.jsx)("option", { value: "light", children: "Light" }), (0, jsx_runtime_1.jsx)("option", { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)("option", { value: "strong", children: "Strong" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 grid gap-4", children: [filtered.map((item) => ((0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700", children: item.category }), (0, jsx_runtime_1.jsx)("span", { className: "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700", children: item.strength })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-rose-200 bg-rose-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-rose-700", children: "Original" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-slate-900", children: item.from || "—" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-emerald-700", children: "Replacement" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-slate-900", children: item.to || "Remove phrase" })] })] }), item.notes ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Notes" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-slate-700", children: item.notes })] })) : null] }, item.id))), filtered.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm", children: "No replacements found." })) : null] })] }) }));
}
