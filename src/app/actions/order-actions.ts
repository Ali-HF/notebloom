"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getOrder, updateOrderStatus } from "@/lib/db";
import { sendEmailNotification } from "@/lib/email";
import { cookies } from "next/headers";

export async function cancelOrderAction(orderId: number): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  const cookieStore = await cookies();
  const hasGuestAccess = cookieStore.get(`guest_order_access_${orderId}`)?.value === "true";

  try {
    // 1. Fetch order
    const order = await getOrder(orderId);
    if (!order) {
      return { error: "Order not found." };
    }

    // 2. Validate ownership (Logged in user or guest with cookie)
    const isOwner = session?.user?.id && Number(session.user.id) === order.user_id;
    if (!isOwner && !hasGuestAccess) {
      return { error: "You are not authorized to cancel this order." };
    }

    // 3. Validate status
    if (order.status !== "Pending") {
      return { error: `Only pending orders can be cancelled. Current status is ${order.status}.` };
    }

    // 4. Cancel the order
    await updateOrderStatus(orderId, "Cancelled");

    // 5. Notify the admin
    try {
      const adminEmail = "admin@paperworm.shop";
      const subject = `Order #${orderId} Cancelled by Customer`;
      const htmlContent = `
        <div style="font-family: sans-serif; line-height: 1.5; color: #222;">
          <h2>Order Cancellation Notice</h2>
          <p>Order <strong>#${orderId}</strong> has been cancelled by the customer.</p>
          <ul>
            <li><strong>Customer Name:</strong> ${order.user_name || "Guest"}</li>
            <li><strong>Customer Email:</strong> ${order.user_email || "No email"}</li>
            <li><strong>Total Value:</strong> PKR ${(order.total_cents / 100).toFixed(2)}</li>
          </ul>
          <p>The order status has been updated to <strong>Cancelled</strong>. If the order was already shipped, stock has been automatically restored.</p>
        </div>
      `;
      await sendEmailNotification(adminEmail, subject, htmlContent);
    } catch (err) {
      console.error("Failed to notify admin of order cancellation:", err);
    }

    // 6. Revalidate pages
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to cancel order:", error);
    return { error: error.message || "An error occurred during order cancellation." };
  }
}
