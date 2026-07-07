import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import BookCover from "@/components/BookCover";
import BloomMark from "@/components/BloomMark";
import BloomDivider from "@/components/BloomDivider";
import { getBook, getOrder, getOrderItems } from "@/lib/db";

export default async function GuestWriteReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orderId?: string; code?: string }>;
}) {
  const { id } = await params;
  const bookId = Number(id);

  const book = await getBook(bookId);
  if (!book) notFound();

  const { orderId, code } = await searchParams;
  const parsedOrderId = orderId ? Number(orderId) : NaN;

  let isValid = false;
  let orderError = "Access denied: A valid delivered order code and ID are required to review this product.";

  if (!Number.isNaN(parsedOrderId) && code) {
    const order = await getOrder(parsedOrderId);
    if (order && order.order_code === code) {
      if (order.status === "Delivered") {
        const items = await getOrderItems(parsedOrderId);
        const hasBook = items.some((item) => item.book_id === bookId);
        if (hasBook) {
          isValid = true;
        } else {
          orderError = "This product was not purchased in the specified order.";
        }
      } else {
        orderError = `This order is currently "${order.status}". You can only review products once the order has been delivered.`;
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 animate-fadeIn">
      <div className="text-center mb-8">
        <BloomMark size={36} className="mx-auto mb-4" />
        <p
          className="text-xs tracking-[0.22em] uppercase text-oxblood mb-2"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Customer Review
        </p>
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Share Your Experience
        </h1>
      </div>

      {!isValid ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <span className="text-3xl mb-3 block">🔒</span>
          <p className="text-sm text-red-800 leading-relaxed mb-4">
            {orderError}
          </p>
          <Link
            href="/shop"
            className="inline-block text-xs uppercase tracking-wider bg-ink hover:bg-ink-soft text-cream px-4 py-2 rounded-full transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Browse stationery
          </Link>
        </div>
      ) : (
        <div className="bg-cream border border-ink/10 rounded-xl p-6 md:p-8 space-y-6">
          {/* Product Header */}
          <div className="flex gap-4 items-center">
            <div className="w-14 shrink-0">
              <BookCover
                title={book.title}
                author={book.author}
                genre=""
                seed={book.cover_seed}
                className="w-full h-auto rounded-xl ring-1 ring-ink/10"
              />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-snug" style={{ fontFamily: "var(--font-body)" }}>
                {book.title}
              </h2>
              <p className="text-sm text-ink-soft">
                by {book.author}
              </p>
            </div>
          </div>

          <BloomDivider />

          {/* Form */}
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-stamp)" }}>
              Write your review
            </p>
            <ReviewForm bookId={bookId} orderId={parsedOrderId} orderCode={code} />
          </div>
        </div>
      )}

      <div className="text-center mt-10">
        <Link href={`/shop/${bookId}`} className="trail-link text-oxblood text-sm">
          ← Back to product details
        </Link>
      </div>
    </div>
  );
}
