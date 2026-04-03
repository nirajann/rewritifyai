import { NextResponse } from "next/server";
import { jsonError } from "@/lib/apiResponse";
import {
  deleteDocument,
  getDocumentById,
  getDocumentVersions,
  renameDocument,
  restoreVersionToDocument,
} from "@/lib/documentService";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const document = await getDocumentById(id);
    const versions = await getDocumentVersions(id);

    return NextResponse.json({
      success: true,
      document,
      versions,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Server error",
      500
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.action === "restoreVersion") {
      const versionId =
        typeof body.versionId === "string" ? body.versionId.trim() : "";

      if (!versionId) {
        return jsonError("versionId is required", 400);
      }

      const restoredDocument = await restoreVersionToDocument(id, versionId);

      return NextResponse.json({
        success: true,
        document: restoredDocument,
      });
    }

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "";

    if (!title) {
      return jsonError("title is required", 400);
    }

    const updated = await renameDocument(id, title);

    return NextResponse.json({
      success: true,
      document: updated,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Server error",
      500
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Server error",
      500
    );
  }
}