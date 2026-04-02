import { NextResponse } from "next/server";
import { rewriteEngine } from "@/lib/rewriteEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await rewriteEngine({
      tool: "grammar",
      inputText: body.inputText,
      tone: body.tone,
      mode: body.mode,
      wordCount: body.wordCount,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}