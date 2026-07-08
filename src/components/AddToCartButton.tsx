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

    // 1. Optimistic UI Update: immediately mark as added
    setStatus("added");
    showToast(`"${bookTitle}" added to cart!`, "success");

    // 2. Optimistic Cart Badge Update: immediately increase by qty
    window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: qty } }));

    // 3. Background Sync & Validation
    fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, qty, color: selectedCategory }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          // Revert full quantity
          window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: -qty } }));
          showToast(data.error || "Failed to add item to cart.", "error");
          setStatus("idle");
          return;
        }

        if (data.addedQty === 0) {
          // Revert full quantity
          window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: -qty } }));
          showToast(`Cannot add more. You already have the maximum available stock of this item in your cart.`, "error");
          setStatus("idle");
          return;
        }

        if (data.capped) {
          // Adjust cart badge for the difference (subtracting the capped amount)
          const diff = data.addedQty - qty; // e.g. 1 - 3 = -2
          window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: diff } }));
          showToast(`Only added ${data.addedQty} units (reached stock limit).`, "error");
        }
      })
      .catch((err) => {
        console.error("Failed to add to cart:", err);
        showToast("Failed to add item to cart.", "error");
        // Revert full quantity
        window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: -qty } }));
        setStatus("idle");
      });

    // Reset the button after 2 seconds so user can add again
    setTimeout(() => setStatus("idle"), 2000);
  };

  if (showQtySelect) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full sm:w-auto" data-no-progress data-no-loading>
        <label htmlFor="qty" className="sr-only">
          Quantity
        </label>
        <select
          id="qty"
          name="qty"
          defaultValue="1"
          className="h-11 rounded-lg border border-ink/20 bg-cream text-ink px-3.5 text-sm focus:border-oxblood focus:outline-none cursor-pointer shadow-sm"
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
          className="flex-1 sm:flex-none h-11 px-6 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark active:scale-95 active:opacity-90
                     transition-all text-sm cursor-pointer disabled:opacity-60 font-semibold shadow-md flex items-center justify-center tracking-wider"
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
        className="text-xs px-3.5 py-2 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark active:scale-95 active:opacity-90
                   transition-all cursor-pointer disabled:opacity-60 font-semibold min-h-[38px] min-w-[75px] shadow-sm flex items-center justify-center"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {status === "added" ? "Added!" : "ADD"}
      </button>
    </form>
  );
}
