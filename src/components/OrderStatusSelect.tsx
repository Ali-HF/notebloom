"use client";

import { updateOrderStatusAction } from "@/app/actions/admin-actions";

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  return (
    <form
      action={async (formData) => {
        await updateOrderStatusAction(orderId, formData);
      }}
      className="inline-block"
    >
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="text-xs rounded-md border border-ink/20 bg-cream px-2 py-1 focus:border-oxblood focus:outline-none transition-colors cursor-pointer"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        <option value="Pending">Pending</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </form>
  );
}
