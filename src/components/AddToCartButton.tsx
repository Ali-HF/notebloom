"use client";

import { useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart-actions";
import { showToast } from "@/lib/toast";

export default function AddToCartButton({
  bookId,
  bookTitle,
  showQtySelect = false,
  maxQty = 10,
}: {
  bookId: number;
  bookTitle: string;
  showQtySelect?: boolean;
  maxQty?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [optimisticAdded, setOptimisticAdded] = useOptimistic<boolean, boolean>(false, (state, action) => action);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const qty = showQtySelect ? Number(formData.get("qty")) : 1;

    startTransition(async () => {
      setOptimisticAdded(true);
      try {
        await addToCartAction(bookId, qty);
          router.refresh();
        // Optimistic success already shown, keep toast for confirmation
        showToast(`"${bookTitle}" added to cart!`, "success");
      } catch (err) {
        // Revert optimistic state on failure
        setOptimisticAdded(false);
        showToast("Failed to add item to cart.", "error");
      }
    });
  };

  if (showQtySelect) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <label htmlFor="qty" className="sr-only">
          Quantity
        </label>
        <select
          id="qty"
          name="qty"
          defaultValue="1"
          className="rounded-md border border-ink/20 bg-cream text-ink px-3 py-2 text-sm focus:border-oxblood focus:outline-none cursor-pointer"
        >
          {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || optimisticAdded}
          className="px-6 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                     transition-colors text-sm cursor-pointer disabled:opacity-60 font-semibold"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {optimisticAdded ? "Added!" : (isPending ? "ADDING..." : "ADD TO CART")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isPending || optimisticAdded}
        className="text-xs px-3 py-1.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors cursor-pointer disabled:opacity-60 font-semibold"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {optimisticAdded ? "Added!" : (isPending ? "..." : "ADD")}
      </button>
    </form>
  );
}
