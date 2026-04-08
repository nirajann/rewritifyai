"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function AuthPage() {
    const [mode, setMode] = (0, react_1.useState)("login");
    const [fullName, setFullName] = (0, react_1.useState)("");
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const router = (0, navigation_1.useRouter)();
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError("");
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                }),
            });
            const raw = await res.text();
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch (_a) {
                throw new Error("Auth server is not set up correctly yet.");
            }
            if (!res.ok || !data.success) {
                throw new Error(data.message ||
                    (mode === "login" ? "Login failed." : "Signup failed."));
            }
            if (data.user) {
                localStorage.setItem("rewritify_user", JSON.stringify(data.user));
            }
            router.push("/dashboard");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("main", { className: "min-h-screen bg-slate-50", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto flex min-h-screen max-w-md items-center px-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-slate-950", children: mode === "login" ? "Welcome back" : "Create your account" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-3 text-base text-slate-600", children: mode === "login"
                            ? "Login to access your workspace and saved documents."
                            : "Sign up to save your documents, versions, and settings." }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 space-y-4", children: [mode === "signup" ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Full name" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Enter your full name", value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none focus:border-emerald-500" })] })) : null, (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Email" }), (0, jsx_runtime_1.jsx)("input", { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none focus:border-emerald-500" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-2 block text-sm font-medium text-slate-700", children: "Password" }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none focus:border-emerald-500" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSubmit, disabled: loading, className: "w-full rounded-2xl bg-emerald-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60", children: loading
                                    ? "Please wait..."
                                    : mode === "login"
                                        ? "Login"
                                        : "Sign Up" }), error ? ((0, jsx_runtime_1.jsx)("div", { className: "rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700", children: error })) : null, (0, jsx_runtime_1.jsx)("button", { onClick: () => setMode((prev) => (prev === "login" ? "signup" : "login")), className: "w-full text-sm font-medium text-slate-600 hover:text-slate-950", children: mode === "login"
                                    ? "Need an account? Sign up"
                                    : "Already have an account? Login" })] })] }) }) }));
}
