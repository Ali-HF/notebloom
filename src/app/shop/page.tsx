import Link from "next/link";
import BookCard from "@/components/BookCard";
import BloomMark from "@/components/BloomMark";
import { listBooks, GENRES } from "@/lib/db";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const { q, genre } = await searchParams;
  const books = await listBooks({ q, genre });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-fadeIn">
      {/* Title Header */}
      <div className="mb-6">
        <p
          className="text-xs tracking-[0.22em] uppercase text-oxblood mb-2"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          The shelves
        </p>
        <h1
          className="text-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          {genre ? genre : "All products"}
        </h1>
      </div>

      {/* Horizontal Category Navigation Bar & Sort Option */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-ink/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-ink-soft mr-4" style={{ fontFamily: "var(--font-stamp)" }}>
            {books.length} {books.length === 1 ? "ITEM" : "ITEMS"}
          </span>
          <Link
            href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors ${
              !genre 
                ? "bg-oxblood text-cream ring-1 ring-oxblood" 
                : "bg-cream text-ink ring-1 ring-ink/15 hover:ring-oxblood hover:text-oxblood"
            }`}
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            All categories
          </Link>
          {GENRES.map((g) => {
            const params = new URLSearchParams();
            params.set("genre", g);
            if (q) params.set("q", q);
            const isActive = genre === g;
            return (
              <Link
                key={g}
                href={`/shop?${params.toString()}`}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-colors ${
                  isActive 
                    ? "bg-oxblood text-cream ring-1 ring-oxblood" 
                    : "bg-cream text-ink ring-1 ring-ink/15 hover:ring-oxblood hover:text-oxblood"
                }`}
                style={{ fontFamily: "var(--font-stamp)" }}
              >
                {g}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-ink-soft uppercase" style={{ fontFamily: "var(--font-stamp)" }}>
            Sort by:
          </span>
          <div className="relative">
            <select
              className="appearance-none bg-cream border border-ink/15 rounded-md px-3 py-1.5 pr-8 text-xs text-ink focus:border-oxblood focus:outline-none cursor-pointer"
              style={{ fontFamily: "var(--font-stamp)" }}
              defaultValue="best"
            >
              <option value="best">Best selling</option>
              <option value="new">New arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-ink-soft">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid area */}
      <div>
        {books.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 gap-4">
            <BloomMark size={40} />
            <p className="text-ink-soft max-w-sm">
              Nothing blooming here. Try a different category or clear your search.
            </p>
            <Link href="/shop" className="trail-link text-oxblood">
              Back to all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

