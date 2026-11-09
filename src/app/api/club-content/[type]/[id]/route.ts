import { deleteClubContent } from "@/lib/club-content";
import { currentAdmin, json } from "@/lib/session";

/** Burahin ang isang event o offer — mawawala agad sa app. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  if (!(await currentAdmin())) return json({ error: "Please sign in." }, 401);
  const { type, id } = await params;
  if ((type !== "event" && type !== "offer") || !/^\d+$/.test(id)) return json({ error: "Not found." }, 404);
  if (!(await deleteClubContent(type, Number(id)))) return json({ error: "Not found." }, 404);
  return json({ ok: true });
}
