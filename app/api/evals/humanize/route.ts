import { NextResponse } from "next/server";
import { jsonFromError } from "@/lib/apiResponse";
import { runHumanizeBenchmark } from "@/lib/evals/humanizeEval";
import type { Strength } from "@/lib/textTools";

export const dynamic = "force-dynamic";

function normalizeStrengths(value: unknown): Strength[] {
  if (!Array.isArray(value)) {
    return ["light", "medium", "strong"];
  }

  const strengths = value.filter(
    (item): item is Strength =>
      item === "light" || item === "medium" || item === "strong",
  );

  return strengths.length > 0 ? strengths : ["light", "medium", "strong"];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const strengths = normalizeStrengths(body?.strengths);

    return NextResponse.json(runHumanizeBenchmark(strengths));
  } catch (error) {
    return jsonFromError(error);
  }
}
