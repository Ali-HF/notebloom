import Link from "next/link";
import BookCover from "@/components/BookCover";
import BloomMark from "@/components/BloomMark";
import { auth } from "@/lib/auth";
import { getCart, formatPrice, getBook, type CartRow } from "@/lib/db";
import { removeFromCartAction } from "@/app/actions/cart-actions";
import CartQtyInput from "@/components/CartQtyInput";
import { cookies } from "next/headers";

export default async function CartPage() {
  const session = await auth();

  let items: CartRow[] = [];
  let total = 0;
  const isGuest = !session?.user?.id;

  if (session?.user?.id) {
    const userId = Number(session.user.id);
    items = await getCart(userId);
  } else {
    try {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        const parsed = JSON.parse(cartCookie);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const resolvedItems = [];
          for (const it of parsed) {
            const book = await getBook(Number(it.book_id));
            if (book) {
              resolvedItems.push({
                id: Number(it.book_id),
                book_id: book.id,
                quantity: Number(it.quantity) || 1,
                title: book.title,
                author: book.author,
                price_cents: book.price_cents,
                cover_seed: book.cover_seed,
                stock: book.stock,
              });
            }
          }
          items = resolvedItems;
        }
      }
    } catch (e) {
      console.error("Error resolving guest cart:", e);
    }
  }

  total = items.reduce((sum, it) => sum + it.price_cents * it.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center flex flex-col items-center gap-4">
        <BloomMark size={40} />
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Your cart is empty
        </h1>
        <p className="text-ink-soft">Find some lovely stationery products to get started.</p>
        <div className="flex gap-3 mt-2">
          {isGuest && (
            <Link
              href="/login?next=/cart"
              className="px-5 py-2.5 rounded-full bg-oxblood text-cream text-sm hover:bg-oxblood-dark transition-colors"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              LOG IN
            </Link>
          )}
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-full ring-1 ring-ink/20 text-sm hover:ring-oxblood transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            BROWSE STORE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1
        className="text-4xl mb-8 font-semibold text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your cart
      </h1>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_320px] gap-8 items-start">

        {/* Cart items */}
        <ul className="divide-y divide-ink/10 border-y border-ink/10 w-full">
          {items.map((item) => (
            <li key={item.id} className="py-5 flex gap-4">

              {/* Image */}
              <Link
                href={`/shop/${item.book_id}`}
                className="w-20 h-20 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-cream"
              >
                <BookCover
                  title={item.title}
                  author={item.author}
                  genre=""
                  seed={item.cover_seed}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Title + remove */}
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/shop/${item.book_id}`} className="hover:text-oxblood transition-colors">
                    <h3
                      className="font-semibold text-sm text-ink leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </h3>
                  </Link>

                  <form action={removeFromCartAction.bind(null, item.book_id)} className="shrink-0">
                    <button
                      type="submit"
                      className="text-ink-soft hover:text-oxblood transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </form>
                </div>

                <p className="text-[11px] text-ink-soft" style={{ fontFamily: "var(--font-stamp)" }}>
                  SKU: NB-00{item.book_id} · {formatPrice(item.price_cents)} each
                </p>

                {/* Qty + line total */}
                <div className="flex items-center justify-between gap-4 mt-1">
                  <CartQtyInput
                    bookId={item.book_id}
                    currentQty={item.quantity}
                    stock={item.stock}
                  />
                  <span
                    className="font-semibold text-sm text-ink"
                    style={{ fontFamily: "var(--font-stamp)" }}
                  >
                    {formatPrice(item.price_cents * item.quantity)}
                  </span>
                </div>
              </div>

            </li>
          ))}
        </ul>

        {/* Order summary — full width on mobile, sidebar on desktop */}
        <aside className="w-full bg-cream border border-[#c8b090] rounded-lg p-6 shadow-sm">
          <h2
            className="text-xs font-bold tracking-[0.08em] text-ink uppercase"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            ORDER SUMMARY
          </h2>
          <hr className="border-t border-[#c8b090]/50 my-4" />
          <div className="flex justify-between text-xs text-ink mb-3" style={{ fontFamily: "var(--font-stamp)" }}>
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink mb-4" style={{ fontFamily: "var(--font-stamp)" }}>
            <span>Shipping</span>
            <span>COD - Free</span>
          </div>
          <hr className="border-t border-[#c8b090]/50 my-4" />
          <div className="flex items-baseline justify-between mb-6" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-2xl font-bold text-ink">Total</span>
            <span className="text-[26px] font-bold text-ink">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-[#3d1208] text-cream hover:bg-[#2c0d06] transition-colors py-3.5 text-center uppercase tracking-wider text-xs font-bold block rounded-[4px]"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            PROCEED TO CHECKOUT
          </Link>
        </aside>
      </div>
    </div>
  );
}