"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./globals.css");
const Navbar_1 = __importDefault(require("@/components/Navbar"));
const CustomCursor_1 = __importDefault(require("@/components/CustomCursor"));
const Footer_1 = __importDefault(require("@/components/Footer"));
exports.metadata = {
    title: "RewritifyAI",
    description: "Premium AI writing workspace",
};
function RootLayout({ children, }) {
    return ((0, jsx_runtime_1.jsx)("html", { lang: "en", children: (0, jsx_runtime_1.jsxs)("body", { className: "bg-slate-50 text-slate-950", children: [(0, jsx_runtime_1.jsx)(CustomCursor_1.default, {}), (0, jsx_runtime_1.jsx)(Navbar_1.default, {}), children, (0, jsx_runtime_1.jsx)(Footer_1.default, {})] }) }));
}
