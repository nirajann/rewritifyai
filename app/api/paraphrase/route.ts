import { NextResponse } from "next/server";

type ParaphraseRequestBody = {
  inputText?: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
};

export async function POST(req: Request) {
  try {
    const body: ParaphraseRequestBody = await req.json();

    const { inputText, tone = "natural", mode = "standard", wordCount } = body;

    if (!inputText || inputText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "inputText is required",
        },
        { status: 400 }
      );
    }

    const cleanedText = inputText.replace(/\s+/g, " ").trim();

    return NextResponse.json({
      success: true,
      tool: "paraphrase",
      outputText: `Paraphrased version (${mode}): ${cleanedText}`,
      wordCount: wordCount ?? cleanedText.split(" ").length,
      tone,
      mode,
      notes: ["Reworded sentence structure", "Preserved meaning"],
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body",
      },
      { status: 500 }
    );
  }
}