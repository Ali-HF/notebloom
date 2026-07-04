import Link from "next/link";
import BookCard from "@/components/BookCard";
import BloomDivider from "@/components/BloomDivider";
import BloomMark from "@/components/BloomMark";
import { listBooks, GENRES } from "@/lib/db";

export default async function HomePage() {
  const featured = (await listBooks()).slice(0, 4);

  return (
    <div>
      {/* minimal welcome header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <p
          className="text-[10px] tracking-[0.22em] uppercase text-oxblood mb-2"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          NoteBloom Stationery
        </p>
        <h1
          className="text-3xl sm:text-5xl font-semibold text-ink tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Beautiful tools for thoughtful ideas.
        </h1>
      </section>

      {/* category navigator */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 border-b border-ink/10">
        <div className="flex overflow-x-auto gap-2 py-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory">
          <Link
            href="/shop"
            className="snap-start shrink-0 px-4 py-2 rounded-full bg-oxblood text-cream text-[10px] font-bold tracking-[0.18em] uppercase hover:bg-oxblood-dark transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            All Products
          </Link>
          {GENRES.map((genre) => (
            <Link
              key={genre}
              href={`/shop?genre=${encodeURIComponent(genre)}`}
              className="snap-start shrink-0 px-4 py-2 rounded-full bg-cream hover:bg-parchment-dark/30 text-ink-soft hover:text-oxblood transition-all text-[10px] font-bold tracking-[0.18em] uppercase border border-ink/5"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              {genre}
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
