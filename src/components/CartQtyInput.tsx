"use client";
import { useOptimistic } from "react";

import { updateCartQtyAction } from "@/app/actions/cart-actions";
import { useTransition } from "react";

export default function CartQtyInput({
  bookId,
  currentQty,
  stock,
  onChange,
}: {
  bookId: number;
  currentQty: number;
  stock: number;
  onChange?: (newQty: number) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticQty, setOptimisticQty] = useOptimistic<number, number>(currentQty, (state, action) => action);

  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleUpdate = (newQty: number) => {
    if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    pendingTimeout.current = setTimeout(() => {
      const formData = new FormData();
      formData.set("qty", String(newQty));
      startTransition(async () => {
        try {
          await updateCartQtyAction(bookId, formData);
        } catch (err) {
          console.error("Failed to update cart quantity:", err);
        }
      });
    }, 300);
  };

  const handleDecrement = () => {
    if (optimisticQty <= 1) return;
    const newQty = optimisticQty - 1;
    setOptimisticQty(newQty);
    if (onChange) onChange(newQty);
  };

  const handleIncrement = () => {
    if (optimisticQty >= stock) return;
    const newQty = optimisticQty + 1;
    setOptimisticQty(newQty);
    if (onChange) onChange(newQty);
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
          disabled={optimisticQty <= 1}
          className={
            `px-3 py-1.5 hover:bg-parchment-dark/30 transition-colors text-ink text-sm border-r border-brass font-bold disabled:opacity-40 cursor-pointer`
          }
        >
          -
        </button>
        <span className="px-4 py-1.5 text-sm font-semibold text-ink bg-transparent select-none min-w-[36px] text-center">
          {optimisticQty}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={optimisticQty >= stock}
          className={`px-3 py-1.5 hover:bg-parchment-dark/30 transition-colors text-ink text-sm border-l border-brass font-bold disabled:opacity-40 cursor-pointer ${isPending ? 'animate-pulse' : ''}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
