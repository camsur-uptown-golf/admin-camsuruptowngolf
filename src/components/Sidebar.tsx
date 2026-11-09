"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "./DashboardProvider";
import { Icon } from "./icons";
import { initials, plural, relative, todayKey } from "@/lib/format";
import { LIST_PAGES } from "@/lib/pages";
import type { ListKind } from "@/lib/types";

type NavKey = ListKind | "overview";

export default function Sidebar() {
  const { admin, data, signOut } = useDashboard();
  const pathname = usePathname();
  const today = todayKey();
  const fresh = (rows: { status: string }[]) => rows.filter((r) => r.status === "new").length;
  const counts: Partial<Record<NavKey, { n: number; title: string }>> = {
    teetimes: (() => {
      const n = data.teetimes.filter((r) => r.date === today && r.status === "confirmed").length;
      return { n, title: `${plural(n, "tee time")} today` };
    })(),
    bookings: { n: fresh(data.bookings), title: plural(fresh(data.bookings), "new request") },
    callbacks: { n: fresh(data.callbacks), title: plural(fresh(data.callbacks), "new request") },
  };

  const link = (key: NavKey) => {
    const href = key === "overview" ? "/" : LIST_PAGES[key].href;
    const label = key === "overview" ? "Overview" : LIST_PAGES[key].title;
    const NavIcon = Icon[key];
    const count = counts[key];
    return (
      <Link key={key} href={href} aria-current={pathname === href ? "page" : undefined}>
        <NavIcon size={18} /> {label}
        {count?.n ? (
          <span className="count" title={count.title}>
            {count.n}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <Image src="/mark.png" alt="" width={38} height={38} priority />
        <div>
          <strong>CamSur Uptown</strong>
          <small>Clubhouse Office</small>
        </div>
      </div>
      <nav className="nav" aria-label="Sections">
        <div className="nav-label">Ledger</div>
        {link("overview")}
        <div className="nav-label">Guests</div>
        {link("teetimes")}
        {link("bookings")}
        {link("callbacks")}
        <div className="nav-label">Audience</div>
        {link("subscribers")}
        {link("members")}
        <div className="nav-label">Member app</div>
        <Link href="/club-content" aria-current={pathname === "/club-content" ? "page" : undefined}>
          <Icon.content size={18} /> Events &amp; offers
        </Link>
      </nav>
      <div className="side-foot">
        <div className="who">
          <span className="avatar" aria-hidden="true">
            {initials(admin.name)}
          </span>
          <div>
            <strong>{admin.name}</strong>
            <small>{admin.lastLoginAt ? `Last sign-in ${relative(admin.lastLoginAt)}` : "First sign-in"}</small>
          </div>
        </div>
        <button className="btn-signout" onClick={signOut} title="Sign out">
          <Icon.signout size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
