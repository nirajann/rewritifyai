import { NextResponse } from "next/server";
import { jsonError } from "@/lib/apiResponse";
import { getDocumentsByUserId } from "@/lib/documentService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return jsonError("userId is required", 400);
    }

    const documents = await getDocumentsByUserId(userId);

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Server error",
      500
    );
  }
}