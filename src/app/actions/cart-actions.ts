"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, addToCart, setCartQty, removeFromCart, placeOrder, saveUserShipping } from "@/lib/db";
import { sendWhatsappNotification } from "@/lib/whatsapp";
import { sendEmailNotification } from "@/lib/email";

export async function addToCartAction(bookId: number, qty: number = 1) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=/shop`);
  }
  await addToCart(Number(session.user.id), bookId, qty);
  revalidatePath("/cart");
  revalidatePath("/shop");
}

export async function addToCartWithQtyAction(bookId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?next=/shop/${bookId}`);
  }
  const qty = Number(formData.get("qty"));
  await addToCart(Number(session.user.id), bookId, Number.isFinite(qty) && qty > 0 ? qty : 1);
  revalidatePath("/cart");
  revalidatePath("/shop");
}

export async function updateCartQtyAction(bookId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const qty = Number(formData.get("qty"));
  await setCartQty(Number(session.user.id), bookId, Number.isFinite(qty) ? qty : 1);
  revalidatePath("/cart");
}

export async function removeFromCartAction(bookId: number) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await removeFromCart(Number(session.user.id), bookId);
  revalidatePath("/cart");
}

export async function checkoutAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/cart");

  const userId = Number(session.user.id);

  // 1. Retrieve all shipping fields
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const area = formData.get("area") as string;
  const city = formData.get("city") as string;
  const altPhone = (formData.get("altPhone") as string) || "";
  const landmark = (formData.get("landmark") as string) || "";
  const apartment = (formData.get("apartment") as string) || "";
  const instructions = (formData.get("instructions") as string) || "";
  const saveAddress = formData.get("saveAddress") === "yes";

  // 2. Validate essential fields
  if (!fullName || fullName.trim() === "") return { error: "Full Name is required." };
  if (!phone || phone.trim() === "") return { error: "Phone Number is required." };
  if (!address || address.trim() === "") return { error: "Street Address is required." };
  if (!area || area.trim() === "") return { error: "Area / Neighbourhood is required." };
  if (!city || city.trim() === "") return { error: "City is required." };

  // 3. Validate cart is not empty
  const cartItems = await getCart(userId);
  if (cartItems.length === 0) {
    return { error: "Your cart is empty. Please add items before checking out." };
  }

  // 4. Serialize shipping details
  const shippingDetails = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    area: area.trim(),
    city: city.trim(),
    altPhone: altPhone.trim(),
    landmark: landmark.trim(),
    apartment: apartment.trim(),
    instructions: instructions.trim(),
  };
  const shippingJson = JSON.stringify(shippingDetails);

  // 5. Place order (handles stock checks and database writes)
  const result = await placeOrder(userId, shippingJson, "cod");
  if ("error" in result) {
    return { error: result.error };
  }

  // 6. Save address for future orders if checked
  if (saveAddress) {
    await saveUserShipping(userId, shippingJson);
  }

  // 7. Format order summary details
  const itemsSummary = cartItems
    .map((item) => `${item.title} x${item.quantity} (PKR ${(item.price_cents / 100).toFixed(2)} each)`)
    .join(", ");
  const totalPKR = `PKR ${(result.total / 100).toFixed(2)}`;

  // 8. Log confirmation details to console
  console.log("\n==================================================");
  console.log("ORDER CONFIRMATION LOGGING");
  console.log(`Order ID:      #${result.orderId}`);
  console.log(`Customer Name: ${fullName}`);
  console.log(`Phone:         ${phone} ${altPhone ? `(Alt: ${altPhone})` : ""}`);
  console.log(`Address:       ${address}`);
  console.log(`Location:      Area: ${area}, City: ${city}`);
  if (apartment) console.log(`Apartment:    ${apartment}`);
  if (landmark)  console.log(`Landmark:     ${landmark}`);
  if (instructions) console.log(`Instructions: ${instructions}`);
  console.log(`Items:         ${itemsSummary}`);
  console.log(`Total:         ${totalPKR}`);
  console.log("==================================================");

  // 9. Send WhatsApp confirmation (fire-and-forget — never block checkout)
  try {
    const whatsappBody =
      `Hi ${fullName}! 🛍️ Thanks for ordering from *The Paperworm*!\n\n` +
      `Your order *#${result.orderId}* (Total: ${totalPKR}) has been received.\n\n` +
      `📦 Reply *confirm* to confirm your order\n` +
      `❌ Reply *cancel* to cancel\n\n` +
      `We'll start processing as soon as you confirm!`;
    const whatsappSent = await sendWhatsappNotification(phone, whatsappBody);
    console.log(`WhatsApp notification ${whatsappSent ? "✅ sent" : "⚠️ skipped/failed"} for order #${result.orderId}`);
  } catch (whatsappError) {
    console.error("WhatsApp notification failed (non-blocking):", whatsappError);
  }

  // 10. Send Simulated Email (fire-and-forget)
  try {
    const emailSubject = `Order #${result.orderId} Confirmation - The Paperworm`;
    const emailHtml = `
      <h1>Thank you for your order, ${fullName}!</h1>
      <p>We've received your order <strong>#${result.orderId}</strong>.</p>
      <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
      <p><strong>Shipping Address:</strong> ${address}, ${area}, ${city}</p>
      <p><strong>Items:</strong> ${itemsSummary}</p>
      <p><strong>Total:</strong> ${totalPKR}</p>
      <p>We will contact you on ${phone} when your package is ready for delivery.</p>
      <p>Please check your WhatsApp and reply <strong>"confirm"</strong> to confirm your order!</p>
    `;
    await sendEmailNotification(session.user.email || "customer@example.com", emailSubject, emailHtml);
  } catch (emailError) {
    console.error("Email notification failed (non-blocking):", emailError);
  }

  revalidatePath("/cart");
  revalidatePath("/account");
  redirect(`/account/orders/${result.orderId}`);
}
