"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import BloomMark from "@/components/BloomMark";
import CartQtyInput from "@/components/CartQtyInput";
import { formatPrice, type CartRow } from "@/lib/cart-utils";

export default function CartClient({
  items,
  isGuest,
}: {
  items: CartRow[];
  isGuest: boolean;
}) {
  const [cartItems, setCartItems] = useState<CartRow[]>(items);
  const qtyTimeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Sync state with props when server re-renders (e.g. full page navigation)
  useEffect(() => {
    setCartItems(items);
  }, [items]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(qtyTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  const handleQtyChange = (bookId: number, newQty: number) => {
    const oldItem = cartItems.find((it) => it.book_id === bookId);
    const oldQty = oldItem ? oldItem.quantity : 0;
    const delta = newQty - oldQty;

    // Instantly update UI state — zero delay
    setCartItems((prev) =>
      prev.map((it) => (it.book_id === bookId ? { ...it, quantity: newQty } : it))
    );

    // Update global cart badge instantly
    window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta } }));

    // Debounce the background sync
    if (qtyTimeouts.current[bookId]) {
      clearTimeout(qtyTimeouts.current[bookId]);
    }

    qtyTimeouts.current[bookId] = setTimeout(() => {
      fetch("/api/cart/update-qty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, qty: newQty }),
      }).catch((err) => {
        console.error("Failed to sync qty:", err);
      });
    }, 400);
  };

  const handleRemove = (bookId: number) => {
    const item = cartItems.find((it) => it.book_id === bookId);
    if (item) {
      // Update global cart badge instantly
      window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: -item.quantity } }));
    }

    // Instantly remove from UI
    setCartItems((prev) => prev.filter((it) => it.book_id !== bookId));

    // Fire-and-forget background sync
    fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    }).catch((err) => {
      console.error("Failed to sync remove:", err);
    });
  };

  const computedTotal = cartItems.reduce(
    (sum, it) => sum + it.price_cents * it.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center flex flex-col items-center gap-4">
        <BloomMark size={40} />
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
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
      <h1 className="text-4xl mb-8 font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
        Your cart
      </h1>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Cart items */}
        <ul className="divide-y divide-ink/10 border-y border-ink/10 w-full">
          {cartItems.map((item) => (
            <li key={item.id} className="py-6 flex flex-col sm:flex-row gap-5 sm:gap-6">
              <div className="flex gap-4 sm:gap-6 flex-1">
                {/* Image */}
                <Link href={`/shop/${item.book_id}`} className="w-24 h-28 sm:w-28 sm:h-32 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-cream">
                  <BookCover
                    title={item.title}
                    author={item.author}
                    genre=""
                    seed={item.cover_seed}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Title + remove */}
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/shop/${item.book_id}`} className="hover:text-oxblood transition-colors pr-2">
                      <h3 className="font-semibold text-base sm:text-lg text-ink leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        {item.title}
                      </h3>
                    </Link>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemove(item.book_id)}
                        className="p-2 -mr-2 -mt-2 text-ink-soft hover:text-oxblood active:scale-90 active:opacity-75 transition-all cursor-pointer rounded-full"
                        aria-label="Remove item"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-ink-soft mt-1" style={{ fontFamily: "var(--font-stamp)" }}>
                    SKU: NB-00{item.book_id} · {formatPrice(item.price_cents)} each
                  </p>
                  
                  <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-4">
                    <CartQtyInput
                      bookId={item.book_id}
                      currentQty={item.quantity}
                      stock={item.stock}
                      onChange={(newQty) => handleQtyChange(item.book_id, newQty)}
                    />
                    <span className="font-semibold text-base text-ink" style={{ fontFamily: "var(--font-stamp)" }}>
                      {formatPrice(item.price_cents * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary */}
        <aside className="w-full bg-cream border border-[#c8b090] rounded-lg p-6 shadow-sm">
          <h2 className="text-xs font-bold tracking-[0.08em] text-ink uppercase" style={{ fontFamily: "var(--font-stamp)" }}>
            ORDER SUMMARY
          </h2>
          <hr className="border-t border-[#c8b090]/50 my-4" />
          <div className="flex justify-between text-xs text-ink mb-3" style={{ fontFamily: "var(--font-stamp)" }}>
            <span>Subtotal</span>
            <span>{formatPrice(computedTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink mb-4" style={{ fontFamily: "var(--font-stamp)" }}>
            <span>Shipping</span>
            <span>COD - Free</span>
          </div>
          <hr className="border-t border-[#c8b090]/50 my-4" />
          <div className="flex items-baseline justify-between mb-6" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-2xl font-bold text-ink">Total</span>
            <span className="text-[26px] font-bold text-ink">{formatPrice(computedTotal)}</span>
          </div>
          <Link href="/checkout" className="w-full bg-[#3d1208] text-cream hover:bg-[#2c0d06] transition-colors py-3.5 text-center uppercase tracking-wider text-xs font-bold block rounded-[4px]" style={{ fontFamily: "var(--font-stamp)" }}>
            PROCEED TO CHECKOUT
          </Link>
        </aside>
      </div>
    </div>
  );
}
