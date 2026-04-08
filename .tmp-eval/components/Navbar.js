"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Navbar;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/workspace", label: "Workspace" },
    { href: "/profile", label: "Profile" },
];
function Navbar() {
    const [user, setUser] = (0, react_1.useState)(null);
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [desktopMenuOpen, setDesktopMenuOpen] = (0, react_1.useState)(false);
    const [mobileMenuOpen, setMobileMenuOpen] = (0, react_1.useState)(false);
    const pathname = (0, navigation_1.usePathname)();
    const router = (0, navigation_1.useRouter)();
    const desktopMenuRef = (0, react_1.useRef)(null);
    const closeMenus = () => {
        setDesktopMenuOpen(false);
        setMobileMenuOpen(false);
    };
    (0, react_1.useEffect)(() => {
        async function syncUserState() {
            const rawUser = localStorage.getItem("rewritify_user");
            if (!rawUser) {
                setUser(null);
                setProfile(null);
                return;
            }
            try {
                const parsedUser = JSON.parse(rawUser);
                setUser(parsedUser);
                try {
                    const res = await fetch(`/api/auth/me?userId=${parsedUser.id}`);
                    const data = await res.json();
                    if (res.ok && data.success) {
                        setProfile(data.profile);
                    }
                }
                catch (_a) {
                    // ignore
                }
            }
            catch (_b) {
                setUser(null);
                setProfile(null);
            }
        }
        void syncUserState();
    }, [pathname]);
    (0, react_1.useEffect)(() => {
        function handleOutsideClick(e) {
            if (!desktopMenuRef.current)
                return;
            if (!desktopMenuRef.current.contains(e.target)) {
                setDesktopMenuOpen(false);
            }
        }
        function handleEscape(e) {
            if (e.key === "Escape") {
                setDesktopMenuOpen(false);
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("rewritify_user");
        closeMenus();
        router.push("/auth");
    };
    const displayName = (0, react_1.useMemo)(() => {
        var _a;
        if ((_a = profile === null || profile === void 0 ? void 0 : profile.full_name) === null || _a === void 0 ? void 0 : _a.trim())
            return profile.full_name.trim();
        if (user === null || user === void 0 ? void 0 : user.email)
            return user.email.split("@")[0];
        return "Guest";
    }, [profile, user]);
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => { var _a; return (_a = part[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase(); })
        .join("");
    const plan = ((profile === null || profile === void 0 ? void 0 : profile.plan) || "free").toLowerCase();
    const planStyles = plan === "pro"
        ? "bg-violet-100 text-violet-700 border-violet-200"
        : plan === "plus"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-emerald-100 text-emerald-700 border-emerald-200";
    const prettyPlan = plan.charAt(0).toUpperCase() + plan.slice(1);
    const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
    return ((0, jsx_runtime_1.jsx)("header", { className: "sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto max-w-7xl px-3 py-3 sm:px-4 md:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex min-w-0 items-center gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setMobileMenuOpen((prev) => !prev), className: "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden", "aria-label": "Toggle menu", children: (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M3 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5zm0 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zm0 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 15z", clipRule: "evenodd" }) }) }), (0, jsx_runtime_1.jsxs)(link_1.default, { href: "/", className: "flex min-w-0 items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-sm", children: "R" }), (0, jsx_runtime_1.jsxs)("div", { className: "min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "truncate text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl", children: "RewritifyAI" }), (0, jsx_runtime_1.jsx)("div", { className: "hidden text-xs font-medium text-slate-400 sm:block", children: "Premium writing workspace" })] })] })] }), (0, jsx_runtime_1.jsx)("nav", { className: "hidden items-center gap-2 md:flex", children: navItems
                                .filter((item) => item.href !== "/profile")
                                .map((item) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: item.href, className: `rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive(item.href)
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`, children: item.label }, item.href))) }), (0, jsx_runtime_1.jsx)("div", { className: "flex shrink-0 items-center gap-2 sm:gap-3", children: !user ? ((0, jsx_runtime_1.jsx)(link_1.default, { href: "/auth", className: "rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600", children: "Login" })) : ((0, jsx_runtime_1.jsxs)("div", { className: "relative", ref: desktopMenuRef, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setDesktopMenuOpen((prev) => !prev), className: "flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm transition hover:bg-slate-50 sm:gap-3 sm:px-3", children: [(0, jsx_runtime_1.jsx)("span", { className: `hidden rounded-full border px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${planStyles}`, children: prettyPlan }), (0, jsx_runtime_1.jsx)("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white", children: initials || "U" }), (0, jsx_runtime_1.jsxs)("div", { className: "hidden text-left lg:block", children: [(0, jsx_runtime_1.jsx)("p", { className: "max-w-[140px] truncate text-sm font-bold text-slate-950", children: displayName }), (0, jsx_runtime_1.jsx)("p", { className: "max-w-[160px] truncate text-xs text-slate-500", children: user.email })] }), (0, jsx_runtime_1.jsx)("svg", { className: `hidden h-4 w-4 text-slate-500 sm:block ${desktopMenuOpen ? "rotate-180" : ""} transition`, viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z", clipRule: "evenodd" }) })] }), desktopMenuOpen ? ((0, jsx_runtime_1.jsxs)("div", { className: "absolute right-0 mt-3 hidden w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:block", children: [(0, jsx_runtime_1.jsxs)("div", { className: "border-b border-slate-100 px-4 py-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "truncate text-sm font-bold text-slate-950", children: displayName }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 truncate text-xs text-slate-500", children: user.email }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3", children: (0, jsx_runtime_1.jsxs)("span", { className: `rounded-full border px-3 py-1 text-xs font-bold ${planStyles}`, children: [prettyPlan, " Plan"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-2", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/profile", onClick: closeMenus, className: "flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950", children: "Profile" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/pricing", onClick: closeMenus, className: "flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950", children: "Pricing" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/profile", onClick: closeMenus, className: "flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950", children: "Settings" })] }), (0, jsx_runtime_1.jsx)("div", { className: "border-t border-slate-100 p-2", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "flex w-full items-center rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50", children: "Logout" }) })] })) : null] })) })] }), mobileMenuOpen ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:hidden", children: [user ? ((0, jsx_runtime_1.jsxs)("div", { className: "mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white", children: initials || "U" }), (0, jsx_runtime_1.jsxs)("div", { className: "min-w-0 flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "truncate text-sm font-bold text-slate-950", children: displayName }), (0, jsx_runtime_1.jsx)("p", { className: "truncate text-xs text-slate-500", children: user.email })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3", children: (0, jsx_runtime_1.jsxs)("span", { className: `rounded-full border px-3 py-1 text-xs font-bold ${planStyles}`, children: [prettyPlan, " Plan"] }) })] })) : null, (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: navItems.map((item) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: item.href, className: `block rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive(item.href)
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`, children: item.label }, item.href))) }), user ? ((0, jsx_runtime_1.jsxs)("div", { className: "mt-3 border-t border-slate-100 pt-3", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: "/pricing", onClick: closeMenus, className: "mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50", children: "Pricing" }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/profile", onClick: closeMenus, className: "mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50", children: "Settings" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50", children: "Logout" })] })) : null] })) : null] }) }));
}
