"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrderAction } from "@/app/actions/order-actions";
import { showToast } from "@/lib/toast";

export default function CancelOrderButton({ orderId, isGuest }: { orderId: number; isGuest: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancel = () => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    startTransition(async () => {
      const res = await cancelOrderAction(orderId);
      if (res?.error) {
        showToast(res.error, "error");
      } else {
        showToast("Order cancelled successfully.", "success");
        router.replace(isGuest ? "/" : "/account");
      }
    });
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="mt-4 px-6 py-2.5 rounded-full border border-oxblood text-oxblood hover:bg-oxblood hover:text-cream
                 transition-all text-xs font-semibold tracking-wider disabled:opacity-60 cursor-pointer uppercase"
      style={{ fontFamily: "var(--font-stamp)" }}
    >
      {isPending ? "CANCELLING…" : "CANCEL ORDER"}
    </button>
  );
}
