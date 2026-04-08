"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function DashboardPage() {
    const [documents, setDocuments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)("");
    const [user, setUser] = (0, react_1.useState)(null);
    const router = (0, navigation_1.useRouter)();
    async function loadDocuments(userId) {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`/api/documents?userId=${userId}`);
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to load documents");
            }
            setDocuments(data.documents || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load documents");
        }
        finally {
            setLoading(false);
        }
    }
    (0, react_1.useEffect)(() => {
        const rawUser = localStorage.getItem("rewritify_user");
        if (!rawUser) {
            router.push("/auth");
            return;
        }
        try {
            const parsedUser = JSON.parse(rawUser);
            setUser(parsedUser);
            loadDocuments(parsedUser.id);
        }
        catch (_a) {
            localStorage.removeItem("rewritify_user");
            router.push("/auth");
        }
    }, [router]);
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-6xl px-4 py-10 md:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-slate-950", children: "Dashboard" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-slate-600", children: "View and reopen your saved documents." }), user && ((0, jsx_runtime_1.jsx)("p", { className: "mt-3 text-sm text-slate-400", children: user.email }))] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-500", children: "Loading documents..." }) })) : error ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm", children: error })) : documents.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-600", children: "No saved documents yet." }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "grid gap-4", children: documents.map((doc) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: `/workspace?id=${doc.id}`, className: "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-slate-950", children: doc.title || "Untitled Document" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-1 text-sm text-slate-500", children: ["Tool: ", doc.tool, " \u00B7 Tone: ", doc.tone, " \u00B7 Mode: ", doc.mode] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3 line-clamp-2 text-sm text-slate-600", children: doc.output_text || doc.input_text || "No preview available." }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-3 text-xs text-slate-400", children: ["Updated: ", new Date(doc.updated_at).toLocaleString()] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-3 text-sm", children: [(0, jsx_runtime_1.jsxs)("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-slate-700", children: [doc.word_count, " words"] }), (0, jsx_runtime_1.jsxs)("span", { className: "rounded-full bg-emerald-100 px-3 py-1 text-emerald-700", children: [doc.human_score, "% human"] })] })] }) }, doc.id))) }))] }) }));
}
