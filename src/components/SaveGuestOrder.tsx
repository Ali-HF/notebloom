"use client";

import { useEffect } from "react";

const GUEST_ORDERS_KEY = "guestOrders";
const EXPIRY_DAYS = 14;

type SavedOrder = { id: string; savedAt: number; orderCode?: string };

/**
 * Renders nothing visible — purely saves the order ID to localStorage
 * with a 14-day expiry timestamp so the guest can find it in My Orders.
 */
export default function SaveGuestOrder({ orderId, orderCode }: { orderId: number; orderCode?: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GUEST_ORDERS_KEY);
      const existing: SavedOrder[] = raw ? JSON.parse(raw) : [];

      const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const now = Date.now();

      // Filter out expired entries
      const fresh = existing.filter((o) => now - o.savedAt < expiryMs);

      // Add this order if not already there
      const id = String(orderId);
      const existingEntry = fresh.find((o) => o.id === id);

      if (existingEntry) {
        existingEntry.savedAt = now;
        if (orderCode) existingEntry.orderCode = orderCode;
      } else {
        fresh.push({ id, savedAt: now, ...(orderCode ? { orderCode } : {}) });
      }

      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.error("SaveGuestOrder: failed to persist order", e);
    }
  }, [orderId, orderCode]);

  return null;
}
