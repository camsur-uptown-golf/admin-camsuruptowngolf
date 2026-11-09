import type { Client, Row } from "@libsql/client";
import { db } from "./db.ts";

/**
 * Events at members' offers ng member app — dito inilalagay ng staff,
 * binabasa ng app sa `/api/app/club` ng site.
 *
 * KAPAREHO ng `camsuruptowngolf/src/lib/club-content-db.ts` ang SCHEMA at ang
 * mga listahan sa ibaba. Pareho silang gumagawa ng table kung wala pa (para
 * gumana ang admin kahit hindi pa nabubuksan ng app), kaya baguhin nang sabay.
 */

export const EVENT_KINDS = ["Tournament", "Social", "Clinic"] as const;
export const CONTENT_IMAGES = ["tournament", "social", "lounge", "pool", "practice", "sky-bar", "course"] as const;

export type ClubEvent = {
  id: number;
  date: string;
  time: string;
  kind: string;
  title: string;
  detail: string;
  image: string;
  createdAt: string;
};

export type ClubOffer = {
  id: number;
  eyebrow: string;
  title: string;
  text: string;
  code: string;
  image: string;
  endsOn: string | null;
  createdAt: string;
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS club_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    time        TEXT    NOT NULL,
    kind        TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    detail      TEXT    NOT NULL,
    image       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS club_events_date ON club_events(date)",
  `CREATE TABLE IF NOT EXISTS club_offers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    eyebrow     TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    text        TEXT    NOT NULL,
    code        TEXT    NOT NULL,
    image       TEXT    NOT NULL,
    ends_on     TEXT,
    created_at  TEXT    NOT NULL
  )`,
];

let ready: Promise<void> | null = null;

/** `null` kapag lokal at wala pa ang database file ng site (tingnan ang db.ts). */
async function connection(): Promise<Client | null> {
  const client = db("inquiries");
  if (!client) return null;
  ready ??= client
    .batch(SCHEMA, "write")
    .then(() => undefined)
    .catch((error) => {
      ready = null;
      throw error;
    });
  await ready;
  return client;
}

const str = (value: unknown) => (value == null ? "" : String(value));

function toEvent(row: Row): ClubEvent {
  return {
    id: Number(row.id),
    date: str(row.date),
    time: str(row.time),
    kind: str(row.kind),
    title: str(row.title),
    detail: str(row.detail),
    image: str(row.image),
    createdAt: str(row.created_at),
  };
}

function toOffer(row: Row): ClubOffer {
  return {
    id: Number(row.id),
    eyebrow: str(row.eyebrow),
    title: str(row.title),
    text: str(row.text),
    code: str(row.code),
    image: str(row.image),
    endsOn: row.ends_on == null ? null : str(row.ends_on),
    createdAt: str(row.created_at),
  };
}

export async function listClubContent(): Promise<{ events: ClubEvent[]; offers: ClubOffer[]; available: boolean }> {
  const client = await connection();
  if (!client) return { events: [], offers: [], available: false };
  const [events, offers] = await client.batch(
    ["SELECT * FROM club_events ORDER BY date DESC, time DESC LIMIT 300", "SELECT * FROM club_offers ORDER BY id DESC LIMIT 100"],
    "read",
  );
  return { events: events.rows.map(toEvent), offers: offers.rows.map(toOffer), available: true };
}

export type NewEvent = Omit<ClubEvent, "id" | "createdAt">;
export type NewOffer = Omit<ClubOffer, "id" | "createdAt">;

export async function createEvent(input: NewEvent): Promise<boolean> {
  const client = await connection();
  if (!client) return false;
  await client.execute({
    sql: "INSERT INTO club_events (date, time, kind, title, detail, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [input.date, input.time, input.kind, input.title, input.detail, input.image, new Date().toISOString()],
  });
  return true;
}

export async function createOffer(input: NewOffer): Promise<boolean> {
  const client = await connection();
  if (!client) return false;
  await client.execute({
    sql: "INSERT INTO club_offers (eyebrow, title, text, code, image, ends_on, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [input.eyebrow, input.title, input.text, input.code, input.image, input.endsOn, new Date().toISOString()],
  });
  return true;
}

export async function deleteClubContent(type: "event" | "offer", id: number): Promise<boolean> {
  const client = await connection();
  if (!client) return false;
  const table = type === "event" ? "club_events" : "club_offers";
  const result = await client.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
  return result.rowsAffected > 0;
}

/**
 * Push sa lahat ng phone na naka-sign-in sa app (`app_push_tokens` ng site,
 * nasa members store). Ilan ang naabot ang ibinabalik; 0 kapag wala pang
 * phone na nakarehistro.
 */
export async function notifyAllMembers(message: { title: string; body: string; url?: string }): Promise<number> {
  const client = db("members");
  if (!client) return 0;
  const exists = await client.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'app_push_tokens'");
  if (exists.rows.length === 0) return 0;
  const tokens = (await client.execute("SELECT token FROM app_push_tokens")).rows.map((row) => String(row.token));
  /* Hanggang 100 mensahe bawat tawag sa Expo. */
  let sent = 0;
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100);
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(
        batch.map((to) => ({ to, title: message.title, body: message.body, sound: "default", data: message.url ? { url: message.url } : {} })),
      ),
    });
    if (!response.ok) throw new Error(`expo push ${response.status}`);
    sent += batch.length;
  }
  return sent;
}
