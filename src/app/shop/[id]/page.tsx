import { notFound } from "next/navigation";
import Link from "next/link";
import ProductImageSlider from "@/components/ProductImageSlider";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import BloomDivider from "@/components/BloomDivider";
import {
  getBook,
  formatPrice,
  getReviewsForBook,
  getRatingSummary,
  hasUserPurchasedBook,
} from "@/lib/db";
import AddToCartButton from "@/components/AddToCartButton";
import { auth } from "@/lib/auth";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = Number(id);
  const book = await getBook(bookId);
  if (!book) notFound();

  const session = await auth();
  const reviews = await getReviewsForBook(bookId);
  const summary = await getRatingSummary(bookId);
  const maxQty = Math.min(book.stock, 10);

  const hasPurchased = session?.user?.id 
    ? await hasUserPurchasedBook(Number(session.user.id), bookId)
    : false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fadeIn">
      {/* Premium breadcrumbs navigation */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft/75 uppercase tracking-wider mb-6" style={{ fontFamily: "var(--font-stamp)" }}>
        <Link href="/" className="hover:text-oxblood transition-colors">HOME</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-oxblood transition-colors">SHOP</Link>
        <span>/</span>
        <Link href={`/shop?genre=${encodeURIComponent(book.genre)}`} className="hover:text-oxblood transition-colors">{book.genre}</Link>
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]">{book.title}</span>
      </div>

      <div className="mt-6 grid sm:grid-cols-[300px_1fr] gap-12">
        <div className="w-full h-fit">
          <ProductImageSlider
            title={book.title}
            author={book.author}
            genre={book.genre}
            coverSeed={book.cover_seed}
            coverSeed2={book.cover_seed_2}
            colorImages={book.color_images}
          />
        </div>

        <div>
          {/* Rebranded category pill badge */}
          <span
            className="inline-block px-3 py-1 bg-oxblood text-cream text-[10px] tracking-[0.18em] uppercase rounded-full mb-3"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            {book.genre}
          </span>
          
          <h1
            className="mt-1 text-4xl leading-tight font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {book.title}
          </h1>
          <p className="mt-1.5 text-lg text-ink-soft">{book.author}</p>

          <div className="mt-3 flex items-center gap-2">
            <StarRating value={summary.avg} size={14} />
            <span className="text-sm text-ink-soft">
              {summary.count > 0
                ? `${summary.avg.toFixed(1)} (${summary.count} ${summary.count === 1 ? "review" : "reviews"})`
                : "No reviews yet"}
            </span>
          </div>

          <p className="mt-6 text-base leading-relaxed text-ink-soft max-w-prose">
            {book.description}
          </p>

          <div
            className="mt-6 text-2xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            {formatPrice(book.price_cents)}
          </div>

          {/* Product stock indicator text */}
          <div className="mt-2 text-xs">
            <span className={`font-semibold ${book.stock > 0 ? "text-moss" : "text-oxblood"}`} style={{ fontFamily: "var(--font-stamp)" }}>
              {book.stock > 0 ? "In-stock" : "Out of stock"}
            </span>
          </div>

          <div className="mt-6">
            {book.stock > 0 ? (
              <div className="flex items-center gap-4">
                <AddToCartButton bookId={book.id} bookTitle={book.title} showQtySelect={true} maxQty={maxQty} />
                <span className="text-xs text-ink-soft" style={{ fontFamily: "var(--font-stamp)" }}>
                  {book.stock} left
                </span>
              </div>
            ) : (
              <p className="text-oxblood text-sm font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                SOLD OUT
              </p>
            )}
          </div>

          <p className="mt-4 text-[10px] text-ink-soft/60" style={{ fontFamily: "var(--font-stamp)" }}>
            SKU {book.isbn}
          </p>
        </div>
      </div>

      <BloomDivider className="my-14" />

      {/* Reviews section styled in 2-column cards layout */}
      <section>
        <h2
          className="text-2xl mb-8"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Customer Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="text-ink-soft mb-8">No one&apos;s reviewed this one yet — be the first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {reviews.map((r) => (
              <div 
                key={r.id} 
                className="bg-cream border border-ink/10 rounded-xl p-5 shadow-[0_4px_12px_rgba(34,29,24,0.06)] hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3 border-b border-ink/5 pb-3 mb-3">
                  <span className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-body)" }}>
                    {r.user_name}
                  </span>
                  <div className="flex items-center">
                    <StarRating value={r.rating} size={11} />
                  </div>
                </div>
                {r.comment ? (
                  <p className="text-sm text-ink-soft leading-relaxed">{r.comment}</p>
                ) : (
                  <p className="text-xs italic text-ink-soft/50">Rating only</p>
                )}
              </div>
            ))}
          </div>
        )}

        {session?.user ? (
          hasPurchased ? (
            <ReviewForm bookId={book.id} />
          ) : (
            <div className="bg-brass/10 border border-brass/20 rounded-lg p-5 max-w-prose">
              <p className="text-sm text-ink-soft leading-relaxed">
                <strong>Verified Purchase Required</strong> — Only customers who have purchased this product and had it delivered can submit a review. If you bought this, please make sure the order status is updated to Delivered in your account.
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-ink-soft">
            <Link href={`/login?next=/shop/${book.id}`} className="trail-link text-oxblood font-semibold">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        )}
      </section>
    </div>
  );
}
