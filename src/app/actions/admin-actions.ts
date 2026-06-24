"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createBook, updateBook, deleteBook, GENRES, updateOrderStatus, getOrder, getOrderItems } from "@/lib/db";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    redirect("/login?next=/admin");
  }
}

const bookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author is required."),
  description: z.string().min(1, "Description is required."),
  genre: z.enum(GENRES, "Choose a genre."),
  price: z.coerce.number().min(0.01, "Price must be more than PKR 0."),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  isbn: z.string().optional().default(""),
  cover_seed: z.string().optional().default(""),
  cover_seed_2: z.string().optional().default(""),
});

export type BookFormState = { error?: string } | undefined;

export async function createBookAction(
  _prev: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createBook({
    title: parsed.data.title,
    author: parsed.data.author,
    description: parsed.data.description,
    genre: parsed.data.genre,
    price_cents: Math.round(parsed.data.price * 100),
    stock: parsed.data.stock,
    isbn: parsed.data.isbn ?? "",
    cover_seed: parsed.data.cover_seed || undefined,
    cover_seed_2: parsed.data.cover_seed_2 || null,
  });

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect("/admin");
}

export async function updateBookAction(
  id: number,
  _prev: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await updateBook(id, {
    title: parsed.data.title,
    author: parsed.data.author,
    description: parsed.data.description,
    genre: parsed.data.genre,
    price_cents: Math.round(parsed.data.price * 100),
    stock: parsed.data.stock,
    isbn: parsed.data.isbn ?? "",
    cover_seed: parsed.data.cover_seed || undefined,
    cover_seed_2: parsed.data.cover_seed_2 || null,
  });

  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);
  redirect("/admin");
}

export async function deleteBookAction(id: number) {
  await requireAdmin();
  await deleteBook(id);
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function updateOrderStatusAction(orderId: number, formData: FormData): Promise<{ error?: string } | undefined> {
  await requireAdmin();
  const status = formData.get("status") as string;
  if (!status) return;

  try {
    await updateOrderStatus(orderId, status);
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { error: error.message || "Failed to update order status." };
  }

  // Trigger status emails asynchronously (fire-and-forget)
  try {
    const order = await getOrder(orderId);
    if (order) {
      const items = await getOrderItems(orderId);
      const shipping = order.shipping_json ? JSON.parse(order.shipping_json) : {};
      
      const email = order.user_email || shipping.email || "";
      const customerName = shipping.fullName || order.user_name || "Customer";

      if (email) {
        if (status === "Shipped") {
          await sendOrderShippedEmail(email, orderId, customerName, items, order.total_cents, {
            address: shipping.address || "",
            area: shipping.area || "",
            city: shipping.city || "",
            phone: shipping.phone || "",
          });
        } else if (status === "Delivered") {
          await sendOrderDeliveredEmail(email, orderId, customerName, items);
        }
      }
    }
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
