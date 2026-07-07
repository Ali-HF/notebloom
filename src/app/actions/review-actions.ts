"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { upsertReview, hasUserPurchasedBook, getOrder, getOrderItems } from "@/lib/db";

export type ReviewState = { error?: string } | undefined;

export async function submitReviewAction(
  bookId: number,
  orderId: number | undefined,
  orderCode: string | undefined,
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").slice(0, 1000);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5." };
  }

  let userId: number;
  const session = await auth();

  // 1. Check if guest validation via orderId and orderCode is provided
  if (orderId && orderCode) {
    const order = await getOrder(orderId);
    if (!order || order.order_code !== orderCode || order.status !== "Delivered") {
      return { error: "Invalid review link or the order is not delivered." };
    }
    const items = await getOrderItems(orderId);
    const hasBook = items.some((item) => item.book_id === bookId);
    if (!hasBook) {
      return { error: "This item is not part of the specified order." };
    }
    userId = order.user_id; // Retrieve guest user_id associated with the order
  } 
  // 2. Otherwise fall back to logged-in user check
  else if (session?.user?.id) {
    const loggedInUserId = Number(session.user.id);
    const isAllowed = session.user.isAdmin || await hasUserPurchasedBook(loggedInUserId, bookId);
    if (!isAllowed) {
      return { error: "Only verified buyers or admins can review this product." };
    }
    userId = loggedInUserId;
  } 
  // 3. Not logged in and no token/order verification provided
  else {
    return { error: "You must be logged in or have a valid review link from your delivered order." };
  }

  await upsertReview(bookId, userId, rating, comment);
  revalidatePath(`/shop/${bookId}`);
  redirect(`/shop/${bookId}#reviews`);
}
