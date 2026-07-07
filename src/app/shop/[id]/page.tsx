import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import BloomDivider from "@/components/BloomDivider";
import StarRating from "@/components/StarRating";
import {
  getBook,
  getReviewsForBook,
  getRatingSummary,
  hasUserPurchasedBook,
} from "@/lib/db";
import ProductDetailsClient from "@/components/ProductDetailsClient";
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

      <ProductDetailsClient book={book} summary={summary} maxQty={maxQty} />

      <BloomDivider className="my-14" />

      {/* Reviews section styled in 2-column cards layout */}
      <section id="reviews">
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
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-body)" }}>
                      {r.user_name}
                    </span>
                    {r.verified && (
                      <span className="text-[10px] text-moss font-semibold uppercase tracking-wider flex items-center gap-1" style={{ fontFamily: "var(--font-stamp)" }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss"></span>
                        Verified Buyer
                      </span>
                    )}
                  </div>
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
          (session.user.isAdmin || hasPurchased) ? (
            <div className="space-y-4">
              <ReviewForm bookId={book.id} />
              {session.user.isAdmin && !hasPurchased && (
                <p className="text-[11px] text-moss max-w-md leading-relaxed italic font-medium">
                  Note: You are writing this review as an Administrator.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              Only customers who have purchased this product and had it delivered can leave a review.
            </p>
          )
        ) : (
          <p className="text-sm text-ink-soft">
            Only customers who have purchased this product and had it delivered can leave a review.{" "}
            <Link href={`/login?next=/shop/${book.id}`} className="trail-link text-oxblood font-semibold">
              Log in
            </Link>{" "}
            to check eligibility.
          </p>
        )}
      </section>
    </div>
  );
}
