import { listBooksWithSales } from "@/lib/db";
import ShopClient from "@/components/ShopClient";

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; genre?: string; sort?: string }>;
}) {
  const { q, genre, sort } = (await searchParams) ?? {};
  const initialBooks = await listBooksWithSales();

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

      <ShopClient
        initialBooks={initialBooks}
        initialGenre={genre}
        initialSort={sort}
        q={q}
      />
    </div>
  );
}
