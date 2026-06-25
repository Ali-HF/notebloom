import Link from "next/link";
import BookCard from "@/components/BookCard";
import BloomDivider from "@/components/BloomDivider";
import BloomMark from "@/components/BloomMark";
import { listBooks, GENRES } from "@/lib/db";

export default async function HomePage() {
  const featured = (await listBooks()).slice(0, 4);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-ink/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center">
          <p
            className="text-xs tracking-[0.22em] uppercase text-oxblood mb-5"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Est. whenever the lights went out too late
          </p>
          <h1
            className="text-5xl sm:text-7xl leading-[1.1] text-ink font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Write your own story.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-ink-soft max-w-2xl leading-relaxed">
            Explore our curated collection of aesthetic Korean stationery for journaling, studying, and creative expression.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-oxblood text-cream px-8 py-3.5
                         text-sm hover:bg-oxblood-dark transition-colors tracking-wider"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              BROWSE SHELVES
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border-2 border-oxblood text-oxblood bg-transparent px-8 py-3.5
                         text-sm hover:bg-oxblood/5 transition-colors tracking-wider"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              NEW ARRIVALS
            </Link>
          </div>
        </div>
      </section>

      {/* category navigator */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-b border-ink/10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-full bg-oxblood text-cream ring-1 ring-oxblood hover:bg-oxblood-dark transition-colors text-sm font-medium tracking-wide"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            ALL PRODUCTS
          </Link>
          {GENRES.map((genre) => (
            <Link
              key={genre}
              href={`/shop?genre=${encodeURIComponent(genre)}`}
              className="px-5 py-2.5 rounded-full bg-cream hover:bg-parchment-dark/30 text-ink ring-1 ring-ink/15 hover:ring-oxblood hover:text-oxblood transition-colors text-sm tracking-wide"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              {genre.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2
            className="text-2xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Fresh off the shelf
          </h2>
          <Link href="/shop" className="trail-link text-sm" style={{ fontFamily: "var(--font-stamp)" }}>
            VIEW ALL →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {featured.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <BloomDivider className="max-w-6xl mx-auto px-4 sm:px-6" />

      {/* trust / how it works */}
      <section className="bg-charcoal text-parchment py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-10">
          <TrustItem
            title="Mint condition, always"
            body="Every item is carefully packed to arrive pristine and ready for your desk."
          />
          <TrustItem
            title="Reviews from real creators"
            body="No star-padding. Ratings come only from people who have actually bought the product."
          />
          <TrustItem
            title="A workspace, not a warehouse"
            body="Selected stationery, chosen on purpose. We'd rather stock fewer things that bring you absolute joy."
          />
        </div>
      </section>
    </div>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <BloomMark size={22} />
      <h3
        className="mt-3 text-lg"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm text-parchment/70 leading-relaxed">{body}</p>
    </div>
  );
}
