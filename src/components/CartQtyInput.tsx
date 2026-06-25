"use client";

import { updateCartQtyAction } from "@/app/actions/cart-actions";
import { useTransition } from "react";

export default function CartQtyInput({
  bookId,
  currentQty,
  stock,
}: {
  bookId: number;
  currentQty: number;
  stock: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDecrement = () => {
    if (currentQty <= 1) return;
    const formData = new FormData();
    formData.set("qty", String(currentQty - 1));
    startTransition(async () => {
      try {
        await updateCartQtyAction(bookId, formData);
      } catch (err) {
        console.error("Failed to update cart quantity:", err);
      }
    });
  };

  const handleIncrement = () => {
    if (currentQty >= stock) return;
    const formData = new FormData();
    formData.set("qty", String(currentQty + 1));
    startTransition(async () => {
      try {
        await updateCartQtyAction(bookId, formData);
      } catch (err) {
        console.error("Failed to update cart quantity:", err);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center rounded-md border border-brass bg-cream overflow-hidden"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentQty <= 1 || isPending}
          className="px-3 py-1.5 hover:bg-parchment-dark/30 transition-colors text-ink text-sm border-r border-brass font-bold disabled:opacity-40 cursor-pointer"
        >
          -
        </button>
        <span className="px-4 py-1.5 text-sm font-semibold text-ink bg-transparent select-none min-w-[36px] text-center">
          {currentQty}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentQty >= stock || isPending}
          className="px-3 py-1.5 hover:bg-parchment-dark/30 transition-colors text-ink text-sm border-l border-brass font-bold disabled:opacity-40 cursor-pointer"
        >
          +
        </button>
      </div>
      {isPending && (
        <span className="text-[10px] text-ink-soft animate-pulse" style={{ fontFamily: "var(--font-stamp)" }}>
          ...
        </span>
      )}
    </div>
  );
}
