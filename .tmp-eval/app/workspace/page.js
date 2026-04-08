"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkspacePage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const exporters_1 = require("@/lib/exporters");
const AnimatedDiffOutput_1 = __importDefault(require("@/components/AnimatedDiffOutput"));
const tools = [
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
];
function WorkspacePage() {
    const [user, setUser] = (0, react_1.useState)(null);
    const [inputText, setInputText] = (0, react_1.useState)("");
    const [outputText, setOutputText] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [loadingDocument, setLoadingDocument] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const [tone, setTone] = (0, react_1.useState)("natural");
    const [mode, setMode] = (0, react_1.useState)("standard");
    const [activeTool, setActiveTool] = (0, react_1.useState)("humanize");
    const [notes, setNotes] = (0, react_1.useState)([]);
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [helperOpen, setHelperOpen] = (0, react_1.useState)(false);
    const [helperMessage, setHelperMessage] = (0, react_1.useState)("Choose a tool, paste your text, and refine it.");
    const [humanScoreState, setHumanScoreState] = (0, react_1.useState)(91);
    const [documentTitle, setDocumentTitle] = (0, react_1.useState)("Untitled Document");
    const [currentDocumentId, setCurrentDocumentId] = (0, react_1.useState)(null);
    const [versions, setVersions] = (0, react_1.useState)([]);
    const [strength, setStrength] = (0, react_1.useState)("medium");
    const [isRetrying, setIsRetrying] = (0, react_1.useState)(false);
    const searchParams = (0, navigation_1.useSearchParams)();
    const urlDocumentId = searchParams.get("id");
    const formatQuotaReset = (resetAt) => {
        if (!resetAt)
            return "later";
        const parsed = new Date(resetAt);
        if (Number.isNaN(parsed.getTime()))
            return "later";
        return parsed.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };
    (0, react_1.useEffect)(() => {
        const rawUser = localStorage.getItem("rewritify_user");
        if (rawUser) {
            try {
                setUser(JSON.parse(rawUser));
            }
            catch (_a) {
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
    const clarityGain = (0, react_1.useMemo)(() => {
        if (!outputText)
            return "+0%";
        if (activeTool === "humanize")
            return "+14%";
        if (activeTool === "rewrite")
            return "+13%";
        if (activeTool === "paraphrase")
            return "+10%";
        if (activeTool === "improve")
            return "+18%";
        if (activeTool === "expand")
            return "+12%";
        if (activeTool === "shorten")
            return "+11%";
        if (activeTool === "grammar")
            return "+15%";
        return "+0%";
    }, [outputText, activeTool]);
    const isWorkingTool = (tool) => {
        return workingTools.includes(tool);
    };
    const loadDocument = async (docId) => {
        const res = await fetch(`/api/documents/${docId}`);
        const data = await res.json();
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
    (0, react_1.useEffect)(() => {
        async function initialLoad() {
            if (!urlDocumentId)
                return;
            try {
                setLoadingDocument(true);
                setError("");
                await loadDocument(urlDocumentId);
                setHelperMessage("Saved document loaded successfully.");
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load document");
            }
            finally {
                setLoadingDocument(false);
            }
        }
        initialLoad();
    }, [urlDocumentId]);
    const refreshVersions = async (docId) => {
        try {
            const res = await fetch(`/api/documents/${docId}`);
            const data = await res.json();
            if (res.ok && data.success) {
                setVersions(data.versions || []);
            }
        }
        catch (_a) {
            // ignore
        }
    };
    const handleTool = async (tool) => {
        var _a, _b;
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
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
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
                    userId: (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : null,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                if (data.code === "quota_exceeded") {
                    setHelperMessage(`Daily limit reached. Your access resets ${formatQuotaReset((_b = data.quota) === null || _b === void 0 ? void 0 : _b.resetAt)}.`);
                }
                else if (data.code === "auth_required") {
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
            setHelperMessage(data.quota
                ? `Your text has been refined and saved. ${data.quota.remaining} rewrites remain today.`
                : "Your text has been refined and saved.");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    const handleTryAgain = async () => {
        var _a;
        if (!inputText.trim() || !outputText.trim())
            return;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
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
            const data = await res.json();
            if (!res.ok || !data.success) {
                if (data.code === "quota_exceeded") {
                    setHelperMessage(`Daily limit reached. Your access resets ${formatQuotaReset((_a = data.quota) === null || _a === void 0 ? void 0 : _a.resetAt)}.`);
                }
                else if (data.code === "auth_required") {
                    setHelperMessage("Sign in to use tracked beta rewrites.");
                }
                throw new Error(data.message || "Retry failed");
            }
            if (typeof data.outputText === "string" && data.outputText.trim()) {
                setOutputText(data.outputText);
                setHelperMessage(data.quota
                    ? `Generated an alternate variation. ${data.quota.remaining} rewrites remain today.`
                    : "Generated an alternate variation.");
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Retry failed");
        }
        finally {
            setIsRetrying(false);
        }
    };
    const handleRestoreVersion = async (versionId) => {
        if (!currentDocumentId)
            return;
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to restore version");
        }
        finally {
            setLoadingDocument(false);
        }
    };
    const handlePreviewVersion = (version) => {
        setInputText(version.input_text || "");
        setOutputText(version.output_text || "");
        setTone(version.tone || "natural");
        setMode(version.mode || "standard");
        setActiveTool(version.tool || "humanize");
        setHumanScoreState(version.human_score || 0);
        setHelperMessage(`Previewing version ${version.version_number}.`);
    };
    const handlePremiumPlaceholder = (tool) => {
        setActiveTool(tool);
        setOutputText("");
        setNotes([]);
        setError("");
        setHumanScoreState(0);
        setHelperMessage(tool === "detector"
            ? "AI Detector is not live yet. The current tile is only a placeholder for a planned feature."
            : "Plagiarism Checker is not live yet. The current tile is only a placeholder for a planned feature.");
    };
    const handleCopy = async () => {
        if (!outputText)
            return;
        try {
            await navigator.clipboard.writeText(outputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch (_a) {
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
        await (0, exporters_1.exportTextAsPdf)(outputText);
        setHelperMessage("Your output has been exported as PDF.");
    };
    const handleExportDocx = async () => {
        if (!outputText) {
            setError("No output text to export.");
            return;
        }
        await (0, exporters_1.exportTextAsDocx)(outputText);
        setHelperMessage("Your output has been exported as Word.");
    };
    const handleDocxUpload = async (file) => {
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        }
    };
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-[1600px] px-4 py-4 sm:px-5 md:px-6", children: [(0, jsx_runtime_1.jsx)("section", { className: "mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold text-slate-950", children: "Workspace" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-slate-500", children: "Focused writing tools with a cleaner editing flow. Beta rewrites are tracked per signed-in account." }), (0, jsx_runtime_1.jsx)("input", { value: documentTitle, onChange: (e) => setDocumentTitle(e.target.value), className: "mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 sm:max-w-md", placeholder: "Document title" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-slate-400", children: currentDocumentId ? "Saved document" : "Unsaved draft" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:h-fit", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-4 text-sm font-semibold text-slate-950", children: "Tools" }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0", children: tools.map((tool) => {
                                        const active = activeTool === tool.id;
                                        return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => tool.id === "detector" || tool.id === "plagiarism"
                                                ? handlePremiumPlaceholder(tool.id)
                                                : setActiveTool(tool.id), className: `flex shrink-0 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition xl:w-full ${active
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`, children: [(0, jsx_runtime_1.jsx)("span", { children: tool.title }), tool.premium ? ((0, jsx_runtime_1.jsx)("span", { className: "ml-3 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700", children: "Pro" })) : null] }, tool.id));
                                    }) })] }), (0, jsx_runtime_1.jsxs)("section", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[160px_160px_160px_140px_minmax(180px,1fr)]", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Tone" }), (0, jsx_runtime_1.jsxs)("select", { value: tone, onChange: (e) => setTone(e.target.value), className: "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "natural", children: "Natural" }), (0, jsx_runtime_1.jsx)("option", { value: "formal", children: "Formal" }), (0, jsx_runtime_1.jsx)("option", { value: "friendly", children: "Friendly" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Strength" }), (0, jsx_runtime_1.jsxs)("select", { value: strength, onChange: (e) => setStrength(e.target.value), className: "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "light", children: "Light" }), (0, jsx_runtime_1.jsx)("option", { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)("option", { value: "strong", children: "Strong" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Mode" }), (0, jsx_runtime_1.jsxs)("select", { value: mode, onChange: (e) => setMode(e.target.value), className: "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "standard", children: "Standard" }), (0, jsx_runtime_1.jsx)("option", { value: "school", children: "School" }), (0, jsx_runtime_1.jsx)("option", { value: "report", children: "Report" }), (0, jsx_runtime_1.jsx)("option", { value: "thesis", children: "Thesis" }), (0, jsx_runtime_1.jsx)("option", { value: "research", children: "Research" }), (0, jsx_runtime_1.jsx)("option", { value: "proposal", children: "Proposal" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Words" }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700", children: [inputWordCount, " words"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2 xl:justify-end", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => isWorkingTool(activeTool) && handleTool(activeTool), disabled: loading || loadingDocument || !isWorkingTool(activeTool), className: "w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60", children: loadingDocument
                                                                ? "Loading..."
                                                                : loading
                                                                    ? "Processing..."
                                                                    : isWorkingTool(activeTool)
                                                                        ? activeTool.charAt(0).toUpperCase() + activeTool.slice(1)
                                                                        : "Premium Tool" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleTryAgain, disabled: isRetrying || !outputText.trim(), className: "w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50", children: isRetrying ? "Trying Again..." : "Try Again" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleCopy, type: "button", className: "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: copied ? "Copied" : "Copy" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleClear, type: "button", className: "rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100", children: "Clear" }), (0, jsx_runtime_1.jsxs)("label", { className: "cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: ["Upload DOCX", (0, jsx_runtime_1.jsx)("input", { type: "file", accept: ".docx", className: "hidden", onChange: (e) => {
                                                                var _a;
                                                                const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                                                                if (file)
                                                                    handleDocxUpload(file);
                                                            } })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleExportPdf, type: "button", className: "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: "Export PDF" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleExportDocx, type: "button", className: "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: "Export Word" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-4 2xl:grid-cols-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Input" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-slate-500", children: [inputWordCount, " words"] })] }), (0, jsx_runtime_1.jsx)("textarea", { value: inputText, onChange: (e) => {
                                                        setInputText(e.target.value);
                                                        if (e.target.value.length > 0) {
                                                            setHelperMessage("Typing detected. Pick a tool to refine your text.");
                                                        }
                                                    }, placeholder: "Paste your text here...", className: "min-h-[320px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 lg:min-h-[620px]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-emerald-200 bg-emerald-50 p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-3 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Output" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-emerald-700", children: [outputWordCount, " words"] })] }), activeTool === "detector" ? ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-[320px] rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-7 text-slate-700 lg:min-h-[620px]", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-lg font-semibold text-slate-950", children: "AI Detector" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3", children: "This feature is not live yet. The current tile is only a placeholder for a planned detector." })] })) : activeTool === "plagiarism" ? ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-[320px] rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-7 text-slate-700 lg:min-h-[620px]", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-lg font-semibold text-slate-950", children: "Plagiarism Checker" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3", children: "This feature is not live yet. The current tile is only a placeholder for a planned originality checker." })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "min-h-[320px] lg:min-h-[620px]", children: (0, jsx_runtime_1.jsx)(AnimatedDiffOutput_1.default, { inputText: inputText, outputText: outputText, isLoading: loading || loadingDocument }) }))] })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", children: error }))] }), (0, jsx_runtime_1.jsxs)("aside", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-bold text-slate-950", children: "Insights" }), (0, jsx_runtime_1.jsx)("span", { className: "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700", children: "Live" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5", children: [(0, jsx_runtime_1.jsx)("div", { className: "mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-emerald-500 bg-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-3xl font-bold text-slate-950", children: [humanScoreState, "%"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-emerald-700", children: "Human score estimate" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between rounded-xl bg-white px-4 py-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-slate-500", children: "Tone" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-slate-950 capitalize", children: tone })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between rounded-xl bg-white px-4 py-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-slate-500", children: "Mode" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-slate-950 capitalize", children: mode })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between rounded-xl bg-white px-4 py-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-slate-500", children: "Estimated clarity gain" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-semibold text-emerald-700", children: clarityGain })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Versions" }), versions.length > 0 ? ((0, jsx_runtime_1.jsx)("ul", { className: "mt-4 space-y-3", children: versions.map((version) => ((0, jsx_runtime_1.jsxs)("li", { className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "font-semibold text-slate-950", children: ["Version ", version.version_number] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-1 text-xs text-slate-500", children: new Date(version.created_at).toLocaleString() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handlePreviewVersion(version), className: "rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50", children: "Preview" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleRestoreVersion(version.id), className: "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100", children: "Restore" })] })] }, version.id))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500", children: "No saved versions yet." }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Processing Notes" }), notes.length > 0 ? ((0, jsx_runtime_1.jsx)("ul", { className: "mt-4 space-y-3", children: notes.map((note, index) => ((0, jsx_runtime_1.jsxs)("li", { className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700", children: ["\u2022 ", note] }, index))) })) : ((0, jsx_runtime_1.jsx)("div", { className: "mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500", children: "Notes will appear after processing." }))] })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setHelperOpen((prev) => !prev), className: "fixed bottom-4 right-4 z-50 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600 sm:bottom-6 sm:right-6 sm:px-5", children: "AI Helper" }), helperOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "fixed bottom-20 right-3 z-50 w-[calc(100vw-24px)] max-w-[320px] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:bottom-24 sm:right-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "AI Helper" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: "Placeholder assistant" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setHelperOpen(false), className: "rounded-full px-2 py-1 text-slate-400 hover:bg-slate-100", children: "\u00D7" })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700", children: helperMessage })] }))] }) }));
}
