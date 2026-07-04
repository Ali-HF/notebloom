import BookCard from "@/components/BookCard";
import BloomMark from "@/components/BloomMark";
import FilterBar from "@/components/FilterBar";
import { listBooks } from "@/lib/db";
import Link from "next/link";

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; genre?: string; sort?: string }>;
}) {
  const { q, genre, sort } = (await searchParams) ?? {};
  const books = await listBooks({ q, genre, sort });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Title */}
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

      <FilterBar genre={genre} q={q} sort={sort} count={books.length} />

      {/* Grid */}
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
