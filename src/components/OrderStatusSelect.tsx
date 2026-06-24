"use client";

import { updateOrderStatusAction } from "@/app/actions/admin-actions";
import { showToast } from "@/lib/toast";

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
        const result = await updateOrderStatusAction(orderId, formData);
        if (result?.error) {
          showToast(result.error, "error");
          // Revert dropdown value
          const selectEl = document.getElementById(`status-select-${orderId}`) as HTMLSelectElement;
          if (selectEl) {
            selectEl.value = currentStatus;
          }
        } else {
          showToast("Order status updated successfully.", "success");
        }
      }}
      className="inline-block"
    >
      <select
        id={`status-select-${orderId}`}
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
