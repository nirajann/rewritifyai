import { jsonFromError } from "@/lib/apiResponse";
import { rewriteEngine, type RewriteTool } from "@/lib/rewriteEngine";
import { validateRewriteRequest } from "@/lib/validators/rewrite";

export async function handleRewriteRoute(req: Request, tool: RewriteTool) {
  try {
    const body = await req.json();
    const validated = validateRewriteRequest(body);

    if (!validated.ok) {
      return jsonFromError(new Error(validated.message), 400);
    }

    const result = await rewriteEngine({
      tool,
      ...validated.data,
    });

    return Response.json(result);
  } catch (error) {
    return jsonFromError(error);
  }
}
