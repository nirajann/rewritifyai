"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Footer;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const footerLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/support", label: "Support" },
];
function Footer() {
    return ((0, jsx_runtime_1.jsx)("footer", { className: "border-t border-slate-200 bg-white", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between", children: [(0, jsx_runtime_1.jsx)("p", { className: "max-w-2xl leading-6", children: "RewritifyAI is a beta writing assistant. Outputs can still need human review, especially for factual, academic, legal, medical, or policy-sensitive use." }), (0, jsx_runtime_1.jsx)("nav", { className: "flex flex-wrap gap-4", children: footerLinks.map((link) => ((0, jsx_runtime_1.jsx)(link_1.default, { href: link.href, className: "font-medium text-slate-700 transition hover:text-slate-950", children: link.label }, link.href))) })] }) }));
}
