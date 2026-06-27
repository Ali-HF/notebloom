"use client";

import { useEffect, useState } from "react";

const GUEST_ORDERS_KEY = "guestOrders";

export default function GuestOrderNumber({ orderId }: { orderId: number }) {
    const [label, setLabel] = useState<string>(`Order #${orderId}`);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(GUEST_ORDERS_KEY);
            if (!raw) return;
            const orders: { id: string; savedAt: number }[] = JSON.parse(raw);
            const sorted = [...orders].sort((a, b) => a.savedAt - b.savedAt);
            const idx = sorted.findIndex((o) => o.id === String(orderId));
            if (idx !== -1) setLabel(`Your order #${idx + 1}`);
        } catch { }
    }, [orderId]);

    return <>{label}</>;
}