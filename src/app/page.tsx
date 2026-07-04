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
      <section className="relative overflow-hidden border-b border-ink/10 bg-gradient-to-b from-cream/20 to-parchment/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-28 flex flex-col items-center text-center">
          <p
            className="text-[10px] sm:text-xs tracking-[0.22em] uppercase text-oxblood mb-5 bg-oxblood/5 px-3 py-1 rounded-full"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Est. whenever the lights went out too late
          </p>
          <h1
            className="text-4xl sm:text-7xl leading-[1.1] text-ink font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Write your own story.
          </h1>
          <p className="mt-5 text-base sm:text-xl text-ink-soft max-w-2xl leading-relaxed px-2">
            Explore our curated collection of aesthetic Korean stationery for journaling, studying, and creative expression.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 w-full sm:w-auto px-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-oxblood text-cream px-8 py-3.5
                         text-sm hover:bg-oxblood-dark transition-colors tracking-wider active:scale-95 shadow-sm"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              BROWSE SHELVES
            </Link>
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border-2 border-oxblood text-oxblood bg-cream/50 px-8 py-3.5
                         text-sm hover:bg-oxblood/5 transition-colors tracking-wider active:scale-95"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              NEW ARRIVALS
            </Link>
          </div>
        </div>
      </section>

      {/* category navigator */}
      {(() => {
        const CATEGORY_DETAILS: Record<string, { desc: string }> = {
          "Notebooks": { desc: "JOURNALS" },
          "Planners": { desc: "PLANNERS" },
          "Pens": { desc: "WRITING" },
          "Sticky Notes": { desc: "MEMOS" },
          "Washi Tape": { desc: "TAPES" },
          "Pencil Cases": { desc: "POUCHES" },
          "Accessories": { desc: "ACCESSORIES" },
          "Desk Decor": { desc: "DESKWARE" },
        };

        return (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 border-b border-ink/10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-ink-soft" style={{ fontFamily: "var(--font-stamp)" }}>
                Shop by Category
              </h2>
              <Link href="/shop" className="trail-link text-xs font-semibold text-oxblood" style={{ fontFamily: "var(--font-stamp)" }}>
                SEE ALL →
              </Link>
            </div>
            
            <div className="flex sm:grid sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-9 gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link
                href="/shop"
                className="snap-start shrink-0 flex flex-col items-center justify-center w-28 h-20 sm:w-auto sm:aspect-[4/3] bg-oxblood text-cream rounded-2xl hover:bg-oxblood-dark transition-all duration-300 shadow-sm flex-none group p-3 active:scale-95"
              >
                <span className="text-sm font-semibold text-center leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Shop All
                </span>
                <span className="text-[8px] tracking-[0.15em] uppercase font-bold text-cream/60 mt-1" style={{ fontFamily: "var(--font-stamp)" }}>
                  COLLECTION
                </span>
              </Link>
              {GENRES.map((genre) => {
                const details = CATEGORY_DETAILS[genre] || { desc: "COZY" };
                return (
                  <Link
                    key={genre}
                    href={`/shop?genre=${encodeURIComponent(genre)}`}
                    className="snap-start shrink-0 flex flex-col items-center justify-center w-28 h-20 sm:w-auto sm:aspect-[4/3] bg-cream border border-ink/8 rounded-2xl hover:border-oxblood/40 hover:shadow-sm transition-all duration-300 flex-none group p-3 active:scale-95"
                  >
                    <span className="text-sm font-semibold text-ink text-center leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {genre}
                    </span>
                    <span className="text-[8px] tracking-[0.15em] uppercase text-ink-soft/40 font-bold mt-1" style={{ fontFamily: "var(--font-stamp)" }}>
                      {details.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

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
