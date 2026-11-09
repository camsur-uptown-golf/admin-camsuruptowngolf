import { CONTENT_IMAGES, EVENT_KINDS, createEvent, createOffer, listClubContent, notifyAllMembers } from "@/lib/club-content";
import { currentAdmin, json, readJson, text } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Lahat ng event at offer ng member app. */
export async function GET() {
  if (!(await currentAdmin())) return json({ error: "Please sign in." }, 401);
  return json(await listClubContent());
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const oneOf = (list: readonly string[], value: string) => (list.includes(value) ? value : null);

/**
 * Bagong event o offer: `{ type: "event" | "offer", …, notify?: boolean }`.
 * `notify`: push sa lahat ng phone na naka-sign-in sa app.
 */
export async function POST(request: Request) {
  if (!(await currentAdmin())) return json({ error: "Please sign in." }, 401);
  const body = await readJson(request);
  const image = oneOf(CONTENT_IMAGES, text(body, "image", 20));
  const title = text(body, "title", 80);
  if (!image || !title) return json({ error: "A title and an image are required." }, 400);

  let saved: boolean;
  let message: { title: string; body: string; url: string };
  if (body.type === "event") {
    const date = text(body, "date", 10);
    const time = text(body, "time", 5);
    const kind = oneOf(EVENT_KINDS, text(body, "kind", 20));
    const detail = text(body, "detail", 120);
    if (!DATE.test(date) || !/^\d{2}:\d{2}$/.test(time) || !kind) return json({ error: "Choose a date, a time and a kind." }, 400);
    saved = await createEvent({ date, time, kind, title, detail, image });
    message = { title: `New ${kind.toLowerCase()}: ${title}`, body: detail || "See the club calendar for details.", url: "/schedule" };
  } else if (body.type === "offer") {
    const code = text(body, "code", 24).toUpperCase();
    const endsOn = text(body, "endsOn", 10) || null;
    if (!code) return json({ error: "An offer needs a code to redeem." }, 400);
    if (endsOn && !DATE.test(endsOn)) return json({ error: "The end date is not valid." }, 400);
    saved = await createOffer({ eyebrow: text(body, "eyebrow", 60), title, text: text(body, "text", 300), code, image, endsOn });
    message = { title: `Members’ offer: ${title}`, body: text(body, "text", 140) || "Open the app to redeem.", url: "/" };
  } else {
    return json({ error: "Unknown type." }, 400);
  }
  if (!saved) return json({ error: "The site database isn't available here." }, 503);

  let notified: number | null = null;
  if (body.notify === true) {
    try {
      notified = await notifyAllMembers(message);
    } catch {
      return json({ ok: true, notified: null, warning: "Saved, but the push notification couldn't be sent." });
    }
  }
  return json({ ok: true, notified });
}
