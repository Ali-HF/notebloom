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

  const handleAction = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateCartQtyAction(bookId, formData);
      } catch (err) {
        console.error("Failed to update cart quantity:", err);
      }
    });
  };

  return (
    <form action={handleAction} className="flex items-center gap-2">
      <label htmlFor={`qty-${bookId}`} className="sr-only">
        Quantity
      </label>
      <input
        id={`qty-${bookId}`}
        name="qty"
        type="number"
        min={1}
        max={stock}
        defaultValue={currentQty}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val >= 1 && val <= stock) {
            e.target.form?.requestSubmit();
          }
        }}
        onBlur={(e) => {
          const val = Number(e.target.value);
          if (!val || val < 1) {
            e.target.value = "1";
            e.target.form?.requestSubmit();
          }
        }}
        disabled={isPending}
        className="w-16 rounded-md border border-ink/20 bg-cream px-2 py-1 text-sm focus:border-oxblood disabled:opacity-60"
      />
      {isPending && (
        <span className="text-[10px] text-ink-soft animate-pulse" style={{ fontFamily: "var(--font-stamp)" }}>
          SAVING...
        </span>
      )}
    </form>
  );
}
