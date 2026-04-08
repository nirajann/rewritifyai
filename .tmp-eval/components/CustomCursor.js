"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CustomCursor;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function CustomCursor() {
    const [position, setPosition] = (0, react_1.useState)({ x: -100, y: -100 });
    const [enabled, setEnabled] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const mediaQuery = window.matchMedia("(pointer: fine)");
        const updateMode = () => {
            setEnabled(mediaQuery.matches);
        };
        updateMode();
        mediaQuery.addEventListener("change", updateMode);
        const handleMove = (e) => {
            setPosition({
                x: e.clientX,
                y: e.clientY,
            });
        };
        window.addEventListener("mousemove", handleMove, { passive: true });
        return () => {
            mediaQuery.removeEventListener("change", updateMode);
            window.removeEventListener("mousemove", handleMove);
        };
    }, []);
    if (!enabled)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 rounded-full border border-emerald-500 bg-emerald-400/20 shadow-[0_0_16px_rgba(16,185,129,0.35)]", style: {
            transform: `translate(${position.x - 8}px, ${position.y - 8}px)`,
        } }));
}
