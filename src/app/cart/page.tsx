import Link from "next/link";
import BookCover from "@/components/BookCover";
import CheckoutForm from "@/components/CheckoutForm";
import WormMark from "@/components/WormMark";
import { auth } from "@/lib/auth";
import { getCart, formatPrice, getUserSavedShipping, getBook, type CartRow } from "@/lib/db";
import { updateCartQtyAction, removeFromCartAction } from "@/app/actions/cart-actions";
import { cookies } from "next/headers";

export default async function CartPage() {
  const session = await auth();
  
  let items: CartRow[] = [];
  let total = 0;
  let savedShipping = null;
  const isGuest = !session?.user?.id;

  if (session?.user?.id) {
    const userId = Number(session.user.id);
    items = await getCart(userId);
    const savedShippingJson = await getUserSavedShipping(userId);
    savedShipping = savedShippingJson ? JSON.parse(savedShippingJson) : null;
  } else {
    // Guest cart resolution from cookies
    try {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("paperworm_cart")?.value;
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
                stock: book.stock
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

  // If no items in cart, show empty cart screen
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center flex flex-col items-center gap-4">
        <WormMark size={40} />
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1
        className="text-4xl mb-8"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        Your cart
      </h1>

      <div className="grid sm:grid-cols-[1fr_300px] gap-12">
        <ul className="divide-y divide-ink/10">
          {items.map((item) => (
            <li key={item.id} className="py-5 flex gap-4">
              <Link href={`/shop/${item.book_id}`} className="w-16 shrink-0">
                <BookCover
                  title={item.title}
                  author={item.author}
                  genre=""
                  seed={item.cover_seed}
                  className="w-full h-auto rounded-xl ring-1 ring-ink/10"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.book_id}`} className="trail-link">
                  <h3 className="font-semibold leading-snug" style={{ fontFamily: "var(--font-body)" }}>
                    {item.title}
                  </h3>
                </Link>
                <p className="text-sm text-ink-soft">{item.author}</p>
                <p className="text-sm mt-1" style={{ fontFamily: "var(--font-stamp)" }}>
                  {formatPrice(item.price_cents)} each
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <form
                    action={updateCartQtyAction.bind(null, item.book_id)}
                    className="flex items-center gap-2"
                  >
                    <label htmlFor={`qty-${item.book_id}`} className="sr-only">
                      Quantity
                    </label>
                    <input
                      id={`qty-${item.book_id}`}
                      name="qty"
                      type="number"
                      min={1}
                      max={item.stock}
                      defaultValue={item.quantity}
                      className="w-16 rounded-md border border-ink/20 bg-cream px-2 py-1 text-sm focus:border-oxblood"
                    />
                    <button
                      type="submit"
                      className="text-xs trail-link text-ink-soft cursor-pointer"
                      style={{ fontFamily: "var(--font-stamp)" }}
                    >
                      UPDATE
                    </button>
                  </form>

                  <form action={removeFromCartAction.bind(null, item.book_id)}>
                    <button
                      type="submit"
                      className="text-xs trail-link text-oxblood cursor-pointer"
                      style={{ fontFamily: "var(--font-stamp)" }}
                    >
                      REMOVE
                    </button>
                  </form>
                </div>
              </div>

              <div className="text-right shrink-0" style={{ fontFamily: "var(--font-stamp)" }}>
                {formatPrice(item.price_cents * item.quantity)}
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit bg-cream rounded-lg ring-1 ring-ink/10 p-6">
          <h2
            className="text-lg mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Order summary
          </h2>
          <div className="flex justify-between text-sm text-ink-soft mb-2">
            <span>Subtotal</span>
            <span style={{ fontFamily: "var(--font-stamp)" }}>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-soft mb-4">
            <span>Shipping</span>
            <span style={{ fontFamily: "var(--font-stamp)" }}>Free</span>
          </div>
          <div className="flex justify-between text-base font-semibold mb-6 pt-4 border-t border-ink/10">
            <span>Total</span>
            <span style={{ fontFamily: "var(--font-stamp)" }}>{formatPrice(total)}</span>
          </div>
          <CheckoutForm savedShipping={savedShipping} isGuest={isGuest} />
        </aside>
      </div>
    </div>
  );
}
