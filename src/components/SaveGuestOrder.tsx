"use client";

import { useEffect } from "react";

const GUEST_ORDERS_KEY = "guestOrders";
const EXPIRY_DAYS = 14;

/**
 * Renders nothing visible — purely saves the order ID to localStorage
 * with a 14-day expiry timestamp so the guest can find it in My Orders.
 */
export default function SaveGuestOrder({ orderId }: { orderId: number }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GUEST_ORDERS_KEY);
      const existing: { id: string; savedAt: number }[] = raw ? JSON.parse(raw) : [];

      const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const now = Date.now();

      // Filter out expired entries
      const fresh = existing.filter((o) => now - o.savedAt < expiryMs);

      // Add this order if not already there
      const id = String(orderId);
      if (!fresh.find((o) => o.id === id)) {
        fresh.push({ id, savedAt: now });
      }

      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.error("SaveGuestOrder: failed to persist order", e);
    }
  }, [orderId]);

  return null;
}
