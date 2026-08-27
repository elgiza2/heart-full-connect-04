/** @doc Vercel serverless endpoint backing the password-protected /m keys page. */
import { handleManusAdmin, type AdminPayload } from "../src/lib/manus/adminCore";
import { apiHeaders } from "../src/lib/api/authenticateRequest";

export const config = { runtime: "nodejs" };

export default async function handler(req: Request): Promise<Response> {
  const cors = apiHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }
  const payload = (await req.json().catch(() => null)) as AdminPayload | null;
  const result = await handleManusAdmin(payload, process.env.M_ADMIN_PASSWORD);
  return new Response(JSON.stringify(result.body), { status: result.status, headers: cors });
}
