import Link from "next/link";
import BloomMark from "./BloomMark";
import { GENRES } from "@/lib/db";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-parchment mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <BloomMark size={24} />
            <span
              className="text-xl"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Notebloom
            </span>
          </div>
          <p className="mt-3 text-sm text-parchment/70 max-w-xs">
            An independent shop for aesthetic stationery, planners, journals, and pens. Beautiful tools to help your ideas bloom.
          </p>
        </div>

        <div>
          <h3
            className="text-xs tracking-[0.18em] uppercase text-brass-light mb-3"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Browse by category
          </h3>
          <ul className="space-y-1.5 text-sm text-parchment/80">
            {GENRES.map((g) => (
              <li key={g}>
                <Link href={`/shop?genre=${encodeURIComponent(g)}`} className="trail-link">
                  {g}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3
            className="text-xs tracking-[0.18em] uppercase text-brass-light mb-3"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Shop
          </h3>
          <ul className="space-y-1.5 text-sm text-parchment/80">
            <li>
              <Link href="/shop" className="trail-link">All products</Link>
            </li>
            <li>
              <Link href="/account" className="trail-link">Your account</Link>
            </li>
            <li>
              <Link href="/cart" className="trail-link">Your cart</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-parchment/10 py-4 text-center text-xs text-parchment/50">
        © {new Date().getFullYear()} Notebloom. Demo storefront — no real orders are processed.
      </div>
    </footer>
  );
}
