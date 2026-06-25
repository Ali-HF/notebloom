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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid sm:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <p
              className="text-xs tracking-[0.22em] uppercase text-oxblood mb-5"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              Est. whenever the lights went out too late
            </p>
            <h1
              className="text-5xl sm:text-6xl leading-[1.05] text-ink"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Write your
              <br />
              own story.
            </h1>
            <p className="mt-6 text-lg text-ink-soft max-w-md leading-relaxed">
              A curated collection of aesthetic Korean stationery, journals, and pens. Beautiful tools to hold your thoughts and organize your day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-oxblood text-cream px-6 py-3
                           text-sm hover:bg-oxblood-dark transition-colors"
                style={{ fontFamily: "var(--font-stamp)" }}
              >
                BROWSE THE SHELVES
              </Link>
              <span className="text-sm text-ink-soft">
                or jump to{" "}
                <Link href="/shop?genre=Notebooks" className="trail-link text-ink">
                  Notebooks
                </Link>
                ,{" "}
                <Link href="/shop?genre=Planners" className="trail-link text-ink">
                  Planners
                </Link>
                ,{" "}
                <Link href="/shop?genre=Washi%20Tape" className="trail-link text-ink">
                  Washi Tape
                </Link>
              </span>
            </div>
          </div>

          <div className="relative flex justify-center sm:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-parchment-dark/70 -rotate-3" />
              <div className="relative bg-cream rounded-[1.5rem] p-8 ring-1 ring-ink/10 rotate-2 shadow-xl">
                <BloomMark size={120} />
              </div>
            </div>
          </div>
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

      {/* genres */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2
          className="text-2xl mb-8"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Pick a bloom
        </h2>
        <div className="flex flex-wrap gap-3">
          {GENRES.map((genre) => (
            <Link
              key={genre}
              href={`/shop?genre=${encodeURIComponent(genre)}`}
              className="px-5 py-2.5 rounded-full bg-cream ring-1 ring-ink/15 hover:ring-oxblood hover:text-oxblood
                         transition-colors text-sm"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              {genre}
            </Link>
          ))}
        </div>
      </section>

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
