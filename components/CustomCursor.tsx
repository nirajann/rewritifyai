"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");

    const updateMode = () => {
      setEnabled(mediaQuery.matches);
    };

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    const handleMove = (e: MouseEvent) => {
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

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 rounded-full border border-emerald-500 bg-emerald-400/20 shadow-[0_0_16px_rgba(16,185,129,0.35)]"
      style={{
        transform: `translate(${position.x - 8}px, ${position.y - 8}px)`,
      }}
    />
  );
}