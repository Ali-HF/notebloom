"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GENRES } from "@/lib/constants";

export default function FilterBar({
  genre,
  q,
  count,
}: {
  genre?: string;
  q?: string;
  count: number;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeLabel = genre ?? "All";

  const pillClass = (active: boolean) =>
    `shrink-0 px-3.5 py-1.5 rounded-full text-[0.7rem] transition-all duration-200 border ${active
      ? "bg-oxblood text-cream border-oxblood shadow-[0_2px_8px_-2px_rgba(124,47,47,0.45)] scale-[1.03]"
      : "bg-parchment text-ink border-ink/12 hover:border-oxblood/40 hover:text-oxblood hover:bg-oxblood/5"
    }`;

  return (
    <div
      className={`sticky top-20 z-30 mb-8 transition-all duration-300
                  bg-cream/90 backdrop-blur-md border border-ink/8
                  ${scrolled
          ? "mx-2 sm:mx-6 rounded-2xl shadow-[0_8px_32px_-8px_rgba(32,40,58,0.18)]"
          : "-mx-4 sm:-mx-6 rounded-b-2xl shadow-[0_4px_24px_-8px_rgba(32,40,58,0.08)]"
        }`}
    >
      {/* Main row */}
      <div className="flex items-center justify-between gap-4 px-6 sm:px-10 py-4">

        {/* Desktop pills */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span
            className="shrink-0 text-[0.65rem] px-2.5 py-1 rounded-full bg-parchment
                       text-ink-soft border border-ink/10 tabular-nums"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            {count} {count === 1 ? "item" : "items"}
          </span>

          <div className="shrink-0 w-px h-4 bg-ink/10 mx-1" />

          <Link
            href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"}
            className={pillClass(!genre)}
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            All
          </Link>

          {GENRES.map((g) => {
            const params = new URLSearchParams();
            params.set("genre", g);
            if (q) params.set("q", q);
            return (
              <Link
                key={g}
                href={`/shop?${params.toString()}`}
                className={pillClass(genre === g)}
                style={{ fontFamily: "var(--font-stamp)" }}
              >
                {g}
              </Link>
            );
          })}
        </div>

        {/* Mobile: active category + toggle */}
        <button
          className="sm:hidden flex items-center gap-2 flex-1"
          onClick={() => setMobileOpen((o) => !o)}
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          <span className="text-[0.7rem] text-ink-soft">{count} items</span>
          <div className="w-px h-4 bg-ink/10 mx-1" />
          <span
            className="px-3.5 py-1.5 rounded-full text-[0.7rem] bg-oxblood text-cream border border-oxblood"
          >
            {activeLabel}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            className={`ml-auto text-ink-soft transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Sort — always visible */}
        <div className="shrink-0 relative">
          <select
            className="appearance-none bg-parchment border border-ink/12 rounded-full
                       pl-3.5 pr-8 py-1.5 text-[0.7rem] text-ink cursor-pointer
                       hover:border-oxblood/40 focus:border-oxblood focus:outline-none transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
            defaultValue="best"
          >
            <option value="best">Best selling</option>
            <option value="new">New arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-ink-soft">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden px-6 pb-4 flex flex-wrap gap-2 border-t border-ink/8 pt-3">
          <Link
            href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"}
            className={pillClass(!genre)}
            style={{ fontFamily: "var(--font-stamp)" }}
            onClick={() => setMobileOpen(false)}
          >
            All
          </Link>
          {GENRES.map((g) => {
            const params = new URLSearchParams();
            params.set("genre", g);
            if (q) params.set("q", q);
            return (
              <Link
                key={g}
                href={`/shop?${params.toString()}`}
                className={pillClass(genre === g)}
                style={{ fontFamily: "var(--font-stamp)" }}
                onClick={() => setMobileOpen(false)}
              >
                {g}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}