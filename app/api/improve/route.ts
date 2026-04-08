import { handleRewriteRoute } from "@/lib/rewriteRoute";

export async function POST(req: Request) {
  return handleRewriteRoute(req, "improve");
}
