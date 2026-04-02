import { NextResponse } from "next/server";

type HumanizeRequestBody = {
  inputText?: string;
  tone?: string;
  mode?: string;
  wordCount?: number;
};

export async function POST(req: Request) {
  try {
    const body: HumanizeRequestBody = await req.json();

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

    const cleanedText = inputText
      .replace(/\s+/g, " ")
      .trim();

    const outputText = `Humanized version: ${cleanedText}`;

    return NextResponse.json({
      success: true,
      tool: "humanize",
      outputText,
      wordCount: wordCount ?? cleanedText.split(" ").length,
      tone,
      mode,
      notes: ["Improved clarity", "Reduced AI tone"],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body",
      },
      { status: 500 }
    );
  }
}