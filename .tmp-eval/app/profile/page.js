"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfilePage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function ProfilePage() {
    var _a;
    const [user, setUser] = (0, react_1.useState)(null);
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [fullName, setFullName] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)("");
    const [error, setError] = (0, react_1.useState)("");
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setError("");
                setMessage("");
                const rawUser = localStorage.getItem("rewritify_user");
                if (!rawUser) {
                    router.push("/auth");
                    return;
                }
                const parsedUser = JSON.parse(rawUser);
                setUser(parsedUser);
                const res = await fetch(`/api/auth/me?userId=${parsedUser.id}`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.message || "Failed to load profile");
                }
                setProfile(data.profile);
                setFullName(data.profile.full_name || "");
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load profile");
            }
            finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [router]);
    const handleSave = async () => {
        try {
            if (!user)
                return;
            setSaving(true);
            setError("");
            setMessage("");
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    fullName,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to update profile");
            }
            setProfile(data.profile);
            setMessage("Profile updated successfully.");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        }
        finally {
            setSaving(false);
        }
    };
    const plan = (0, react_1.useMemo)(() => {
        return ((profile === null || profile === void 0 ? void 0 : profile.plan) || "free").toLowerCase();
    }, [profile]);
    const planStyles = plan === "pro"
        ? "bg-violet-100 text-violet-700 border-violet-200"
        : plan === "plus"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-emerald-100 text-emerald-700 border-emerald-200";
    const prettyPlan = plan.charAt(0).toUpperCase() + plan.slice(1);
    const displayName = (fullName === null || fullName === void 0 ? void 0 : fullName.trim()) || ((_a = profile === null || profile === void 0 ? void 0 : profile.email) === null || _a === void 0 ? void 0 : _a.split("@")[0]) || "User";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => { var _a; return (_a = part[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase(); })
        .join("");
    const joinedDate = (profile === null || profile === void 0 ? void 0 : profile.created_at)
        ? new Date(profile.created_at).toLocaleDateString()
        : "Recently";
    const updatedDate = (profile === null || profile === void 0 ? void 0 : profile.updated_at)
        ? new Date(profile.updated_at).toLocaleString()
        : "Not available";
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-6xl px-4 py-10 md:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold tracking-tight text-slate-950", children: "Profile Settings" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-slate-600", children: "Manage your account details and review your current beta access." })] }), loading ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-3xl border border-slate-200 bg-white p-8 shadow-sm", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-500", children: "Loading profile..." }) })) : error ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm", children: error })) : ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [(0, jsx_runtime_1.jsxs)("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white shadow-sm", children: initials || "U" }), (0, jsx_runtime_1.jsx)("h2", { className: "mt-4 text-2xl font-bold text-slate-950", children: displayName }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-slate-500", children: (profile === null || profile === void 0 ? void 0 : profile.email) || (user === null || user === void 0 ? void 0 : user.email) }), (0, jsx_runtime_1.jsxs)("div", { className: `mt-4 rounded-full border px-4 py-2 text-sm font-semibold ${planStyles}`, children: [prettyPlan, " Plan"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Joined" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm font-semibold text-slate-950", children: joinedDate })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Last updated" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm font-semibold text-slate-950", children: updatedDate })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Account status" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm font-semibold text-emerald-700", children: "Active" })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold text-slate-950", children: "Personal Information" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-slate-500", children: "Update your visible profile details here." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 gap-5 md:grid-cols-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "md:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Full name" }), (0, jsx_runtime_1.jsx)("input", { value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Enter your full name", className: "w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-emerald-500" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "md:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Email address" }), (0, jsx_runtime_1.jsx)("input", { value: (profile === null || profile === void 0 ? void 0 : profile.email) || (user === null || user === void 0 ? void 0 : user.email) || "", disabled: true, className: "w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-4 text-base text-slate-600 outline-none" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Current plan" }), (0, jsx_runtime_1.jsx)("div", { className: `rounded-2xl border px-4 py-4 text-base font-semibold ${planStyles}`, children: prettyPlan })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Account type" }), (0, jsx_runtime_1.jsx)("div", { className: "rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-800", children: "Personal" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 flex flex-wrap gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleSave, disabled: saving, className: "rounded-2xl bg-emerald-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60", children: saving ? "Saving..." : "Save Changes" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                setFullName((profile === null || profile === void 0 ? void 0 : profile.full_name) || "");
                                                setMessage("");
                                                setError("");
                                            }, type: "button", className: "rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50", children: "Reset" })] }), message ? ((0, jsx_runtime_1.jsx)("div", { className: "mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700", children: message })) : null, error ? ((0, jsx_runtime_1.jsx)("div", { className: "mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700", children: error })) : null, (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-4 md:flex-row md:items-start md:justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-bold text-slate-950", children: "Plan Overview" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-slate-500", children: "Daily rewrite limits are active for beta accounts, but billing and higher-tier access are not fully active yet." })] }), (0, jsx_runtime_1.jsxs)("div", { className: `rounded-full border px-4 py-2 text-sm font-semibold ${planStyles}`, children: [prettyPlan, " Plan"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-5 grid grid-cols-1 gap-4 md:grid-cols-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Current access" }), (0, jsx_runtime_1.jsxs)("ul", { className: "mt-3 space-y-2 text-sm text-slate-600", children: [(0, jsx_runtime_1.jsx)("li", { children: "Humanize, rewrite, and paraphrase" }), (0, jsx_runtime_1.jsx)("li", { children: "Saved documents and versions" }), (0, jsx_runtime_1.jsx)("li", { children: "Basic workspace tools" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Planned additions" }), (0, jsx_runtime_1.jsxs)("ul", { className: "mt-3 space-y-2 text-sm text-slate-600", children: [(0, jsx_runtime_1.jsx)("li", { children: "AI Detector placeholder" }), (0, jsx_runtime_1.jsx)("li", { children: "Plagiarism Checker placeholder" }), (0, jsx_runtime_1.jsx)("li", { children: "Higher rewrite limits are not live yet" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "rounded-2xl border border-slate-200 bg-white p-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-semibold text-slate-950", children: "Beta status" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-3 text-sm text-slate-600", children: ["You are currently on the", " ", (0, jsx_runtime_1.jsx)("span", { className: "font-semibold", children: prettyPlan }), " plan."] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-sm text-slate-600", children: "Billing actions are not live yet. Use the pricing page for current beta plan information." }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 flex flex-wrap gap-3", children: [(0, jsx_runtime_1.jsx)("a", { href: "/pricing", className: "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800", children: "View Pricing" }), (0, jsx_runtime_1.jsx)("a", { href: "/support", className: "rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50", children: "Contact Support" })] })] })] })] })] })] }))] }) }));
}
