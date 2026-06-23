"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createBook, updateBook, deleteBook, GENRES, updateOrderStatus } from "@/lib/db";

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

export async function updateOrderStatusAction(orderId: number, formData: FormData) {
  await requireAdmin();
  const status = formData.get("status") as string;
  if (!status) return;
  await updateOrderStatus(orderId, status);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
