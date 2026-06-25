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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
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

      <div className="grid sm:grid-cols-[220px_1fr] gap-10">
        <aside className="space-y-8">
          <form action="/shop" className="space-y-2">
            {genre && <input type="hidden" name="genre" value={genre} />}
            <label
              htmlFor="q"
              className="text-xs tracking-[0.18em] uppercase text-ink-soft block"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ""}
              type="search"
              placeholder="Search notebooks, pens, washi..."
              className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm
                         focus:border-oxblood transition-colors"
            />
          </form>

          <div>
            <h2
              className="text-xs tracking-[0.18em] uppercase text-ink-soft mb-3"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              Category
            </h2>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href={q ? `/shop?q=${encodeURIComponent(q)}` : "/shop"}
                  aria-current={!genre ? "page" : undefined}
                  className={`trail-link ${!genre ? "text-oxblood" : "text-ink"}`}
                >
                  All categories
                </Link>
              </li>

              {GENRES.map((g) => {
                const params = new URLSearchParams();
                params.set("genre", g);
                if (q) params.set("q", q);
                return (
                  <li key={g}>
                    <Link
                      href={`/shop?${params.toString()}`}
                      aria-current={genre === g ? "page" : undefined}
                      className={`trail-link ${genre === g ? "text-oxblood" : "text-ink"}`}
                    >
                      {g}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div>
          <p className="text-sm text-ink-soft mb-6" style={{ fontFamily: "var(--font-stamp)" }}>
            {books.length} {books.length === 1 ? "PRODUCT" : "PRODUCTS"}
          </p>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
