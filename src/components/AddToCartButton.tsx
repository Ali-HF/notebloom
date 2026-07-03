"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";

export default function AddToCartButton({
  bookId,
  bookTitle,
  showQtySelect = false,
  maxQty = 10,
  selectedCategory,
}: {
  bookId: number;
  bookTitle: string;
  showQtySelect?: boolean;
  maxQty?: number;
  selectedCategory?: string;
}) {
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle") return;

    const formData = new FormData(e.currentTarget);
    const qty = showQtySelect ? Number(formData.get("qty")) || 1 : 1;

    // Instant UI feedback
    setStatus("added");
    showToast(`"${bookTitle}" added to cart!`, "success");

    // Update the header cart badge instantly
    window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: qty } }));

    // Fire-and-forget background sync
    fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, qty, color: selectedCategory }),
    }).catch((err) => {
      console.error("Failed to add to cart:", err);
      showToast("Failed to add item to cart.", "error");
      // Revert badge
      window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: -qty } }));
      setStatus("idle");
    });

    // Reset the button after 2 seconds so user can add again
    setTimeout(() => setStatus("idle"), 2000);
  };

  if (showQtySelect) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3" data-no-progress data-no-loading>
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
          disabled={status === "adding"}
          className="px-6 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark active:scale-95 active:opacity-90
                     transition-all text-sm cursor-pointer disabled:opacity-60 font-semibold"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {status === "added" ? "Added!" : "ADD TO CART"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-no-progress data-no-loading>
      <button
        type="submit"
        disabled={status === "adding"}
        className="text-xs px-3 py-1.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark active:scale-95 active:opacity-90
                   transition-all cursor-pointer disabled:opacity-60 font-semibold min-h-[36px] min-w-[70px]"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {status === "added" ? "Added!" : "ADD"}
      </button>
    </form>
  );
}
