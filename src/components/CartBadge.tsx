"use client";

import { useEffect, useState } from "react";

/**
 * Client-side cart badge that listens for "cart-update" custom events
 * to update the count instantly, without waiting for a server round-trip.
 *
 * Events should be dispatched as:
 *   window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: 1 } }))
 *   window.dispatchEvent(new CustomEvent("cart-update", { detail: { delta: -2 } }))
 */
export default function CartBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const handler = (e: Event) => {
      const delta = (e as CustomEvent).detail?.delta ?? 0;
      setCount((prev) => Math.max(0, prev + delta));
    };
    window.addEventListener("cart-update", handler);
    return () => window.removeEventListener("cart-update", handler);
  }, []);

  if (count <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-oxblood text-cream text-[10px] px-1">
      {count}
    </span>
  );
}
