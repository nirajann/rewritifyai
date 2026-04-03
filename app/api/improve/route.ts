import { NextResponse } from "next/server";
import { jsonError } from "@/lib/apiResponse";
import { rewriteEngine } from "@/lib/rewriteEngine";
import { validateRewriteRequest } from "@/lib/validators/rewrite";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = validateRewriteRequest(body);

    if (!validated.ok) {
      return jsonError(validated.message, 400);
    }

    const result = await rewriteEngine({
      tool: "improve",
      ...validated.data,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Server error",
      500
    );
  }
}