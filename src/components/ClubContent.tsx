"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useDashboard } from "./DashboardProvider";
import Topbar from "./Topbar";
import { EmptyState } from "./ui";
import type { ClubEvent, ClubOffer } from "@/lib/club-content";

/* Kapareho ng `CONTENT_IMAGES` / `EVENT_KINDS` sa lib/club-content.ts — dito
   inuulit dahil client component ito (walang database import). */
const IMAGES: [string, string][] = [
  ["tournament", "Tournament"],
  ["social", "Social / terrace"],
  ["lounge", "Members’ Lounge"],
  ["pool", "Pool"],
  ["practice", "Practice bays"],
  ["sky-bar", "Sky Bar"],
  ["course", "Course"],
];
const KINDS = ["Tournament", "Social", "Clinic"];

type Content = { events: ClubEvent[]; offers: ClubOffer[]; available: boolean };

const clock = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const day = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

/** Events & offers ng member app — idagdag, burahin, at (opsyonal) i-push sa members. */
export default function ClubContent() {
  const { showToast } = useDashboard();
  const [content, setContent] = useState<Content | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/club-content", { cache: "no-store" });
    if (response.ok) setContent(await response.json());
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function remove(type: "event" | "offer", id: number, title: string) {
    if (!confirm(`Remove “${title}” from the member app?`)) return;
    const response = await fetch(`/api/club-content/${type}/${id}`, { method: "DELETE" });
    showToast(response.ok ? "Removed from the app." : "Couldn't remove it.", response.ok ? "" : "error");
    load();
  }

  return (
    <>
      <Topbar title="Events & offers" />
      <p className="content-lede">
        What members see in the app’s club calendar and on its Home screen. Changes show the next time a member opens the app.
      </p>
      {content && !content.available ? <p className="form-error">The site database isn’t available on this computer.</p> : null}

      <div className="content-grid">
        <section className="card">
          <div className="card-head">
            <h3>Club calendar</h3>
            <small>{content ? `${content.events.length} events` : "Loading…"}</small>
          </div>
          <div className="card-body">
            <EventForm onSaved={load} />
            <ContentTable
              empty="No events yet."
              rows={(content?.events ?? []).map((e) => ({
                id: e.id,
                primary: e.title,
                secondary: `${e.kind} · ${day(e.date)} · ${clock(e.time)}${e.detail ? ` · ${e.detail}` : ""}`,
                onRemove: () => remove("event", e.id, e.title),
              }))}
            />
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Members’ offers</h3>
            <small>{content ? `${content.offers.length} offers` : "Loading…"}</small>
          </div>
          <div className="card-body">
            <OfferForm onSaved={load} />
            <ContentTable
              empty="No offers yet."
              rows={(content?.offers ?? []).map((o) => ({
                id: o.id,
                primary: o.title,
                secondary: `Code ${o.code} · ${o.endsOn ? `ends ${day(o.endsOn)}` : "no end date"}`,
                onRemove: () => remove("offer", o.id, o.title),
              }))}
            />
          </div>
        </section>
      </div>
    </>
  );
}

function ContentTable({ rows, empty }: { rows: { id: number; primary: string; secondary: string; onRemove: () => void }[]; empty: string }) {
  if (rows.length === 0) return <EmptyState title={empty} small />;
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <span className="primary">{row.primary}</span>
                <span className="secondary">{row.secondary}</span>
              </td>
              <td className="nowrap content-actions">
                <button className="btn-ghost" onClick={row.onRemove}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Ipinapadala ang form; ibinabalik kung nai-save. */
function useSubmit(type: "event" | "offer", onSaved: () => void) {
  const { showToast } = useDashboard();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setSaving(true);
    setError("");
    const response = await fetch("/api/club-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, type, notify: fields.notify === "on" }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(body.error || "Couldn't save.");
      return;
    }
    form.reset();
    onSaved();
    if (body.warning) showToast(body.warning, "error");
    else if (typeof body.notified === "number") showToast(`Saved · sent to ${body.notified} ${body.notified === 1 ? "phone" : "phones"}.`);
    else showToast("Saved · now in the app.");
  }
  return { submit, error, saving };
}

function NotifyBox() {
  return (
    <label className="content-notify">
      <input type="checkbox" name="notify" /> Send a push notification to members
    </label>
  );
}

function ImageSelect() {
  return (
    <label className="field">
      <span>Picture</span>
      <select className="select" name="image" defaultValue="course">
        {IMAGES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EventForm({ onSaved }: { onSaved: () => void }) {
  const { submit, error, saving } = useSubmit("event", onSaved);
  return (
    <form className="content-form" onSubmit={submit}>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="content-row">
        <label className="field">
          <span>Date</span>
          <input type="date" name="date" required />
        </label>
        <label className="field">
          <span>Start</span>
          <input type="time" name="time" required defaultValue="07:00" />
        </label>
        <label className="field">
          <span>Kind</span>
          <select className="select" name="kind" defaultValue="Tournament">
            {KINDS.map((kind) => (
              <option key={kind}>{kind}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Title</span>
        <input name="title" required maxLength={80} placeholder="Members’ medal" />
      </label>
      <label className="field">
        <span>Detail</span>
        <input name="detail" maxLength={120} placeholder="Stroke play · members" />
      </label>
      <ImageSelect />
      <NotifyBox />
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Add event"}
      </button>
    </form>
  );
}

function OfferForm({ onSaved }: { onSaved: () => void }) {
  const { submit, error, saving } = useSubmit("offer", onSaved);
  return (
    <form className="content-form" onSubmit={submit}>
      {error ? <p className="form-error">{error}</p> : null}
      <label className="field">
        <span>Title</span>
        <input name="title" required maxLength={80} placeholder="Stay & Play weekends" />
      </label>
      <label className="field">
        <span>Small line above the title</span>
        <input name="eyebrow" maxLength={60} placeholder="Members’ offer · Ends 30 Nov" />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea name="text" maxLength={300} rows={3} placeholder="Two rounds, a lakeside table for two and late checkout." />
      </label>
      <div className="content-row">
        <label className="field">
          <span>Code to redeem</span>
          <input name="code" required maxLength={24} placeholder="UPTOWN26" />
        </label>
        <label className="field">
          <span>Last day (optional)</span>
          <input type="date" name="endsOn" />
        </label>
      </div>
      <ImageSelect />
      <NotifyBox />
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Add offer"}
      </button>
    </form>
  );
}
