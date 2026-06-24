import bcrypt from "bcryptjs";
import * as db from "../src/lib/db";

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok  :", msg);
  }
}

async function main() {
  console.log("Running manual checks against database...");

  // Verify connection URL exists
  if (!process.env.DATABASE_URL) {
    console.error("FAIL: DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  // Ensure DB seed completes
  await db.seedIfEmpty();

  // seed sanity
  const books = await db.listBooks();
  assert(books.length === 10, `seed created 10 products (got ${books.length})`);

  const admin = await db.getUserByEmail("admin@paperworm.shop");
  assert(!!admin && admin.is_admin === 1, "seed admin exists and is_admin=1");
  assert(
    !!admin && bcrypt.compareSync("paperworm123", admin.password_hash),
    "seed admin password verifies"
  );

  // signup
  const hash = bcrypt.hashSync("testpass123", 10);
  const userId = await db.createUser("Test Reader", "reader@example.com", hash);
  const user = await db.getUserById(userId);
  assert(!!user && user.email === "reader@example.com", "createUser/getUserById round-trip");
  assert(!!user && user.is_admin === 0, "new user is not admin by default");

  // duplicate email should be findable (app layer blocks re-signup)
  const dup = await db.getUserByEmail("reader@example.com");
  assert(!!dup, "getUserByEmail finds the new user");

  // genre filter + search
  const washiTapes = await db.listBooks({ genre: "Washi Tape" });
  assert(washiTapes.length > 0 && washiTapes.every((b) => b.genre === "Washi Tape"), "genre filter works");
  const searchResults = await db.listBooks({ q: "strawberry" });
  assert(searchResults.some((b) => b.title.toLowerCase().includes("strawberry")), "title search works");

  // cart
  const book = books[0];
  const book2 = books[1];
  await db.addToCart(userId, book.id, 2);
  await db.addToCart(userId, book2.id, 1);
  await db.addToCart(userId, book.id, 1); // should bump qty to 3 (upsert)
  let cart = await db.getCart(userId);
  const cartLine = cart.find((c) => c.book_id === book.id);
  assert(cart.length === 2, `cart has 2 distinct lines (got ${cart.length})`);
  assert(!!cartLine && cartLine.quantity === 3, `repeated add accumulates quantity (got ${cartLine?.quantity})`);
  assert((await db.cartCount(userId)) === 4, `cartCount sums quantities (got ${await db.cartCount(userId)})`);

  await db.setCartQty(userId, book2.id, 5);
  cart = await db.getCart(userId);
  assert(cart.find((c) => c.book_id === book2.id)?.quantity === 5, "setCartQty updates quantity");

  await db.setCartQty(userId, book2.id, 0);
  cart = await db.getCart(userId);
  assert(!cart.find((c) => c.book_id === book2.id), "setCartQty(0) removes the line");

  // out-of-stock guard
  const tooMany = 9999;
  await db.setCartQty(userId, book.id, tooMany);
  const overResult = await db.placeOrder(userId);
  assert("error" in overResult, "placeOrder rejects when quantity exceeds stock");
  await db.setCartQty(userId, book.id, 2); // back to a sane qty

  // checkout
  const currentBook = await db.getBook(book.id);
  const stockBefore = currentBook!.stock;
  const orderResult = await db.placeOrder(userId);
  assert(!("error" in orderResult), "placeOrder succeeds with valid cart");
  if (!("error" in orderResult)) {
    const order = (await db.getOrdersForUser(userId)).find((o) => o.id === orderResult.orderId);
    assert(!!order && order.total_cents === orderResult.total, "order recorded with correct total");
    const items = await db.getOrderItems(orderResult.orderId);
    assert(items.length === 1 && items[0].quantity === 2, "order_items snapshot matches cart");
    let updatedBook = await db.getBook(book.id);
    let stockAfter = updatedBook!.stock;
    assert(stockAfter === stockBefore, `stock NOT decremented at checkout (before=${stockBefore}, after=${stockAfter})`);

    // Transition to Shipped should decrement stock
    await db.updateOrderStatus(orderResult.orderId, "Shipped");
    updatedBook = await db.getBook(book.id);
    stockAfter = updatedBook!.stock;
    assert(stockAfter === stockBefore - 2, `stock decremented on Shipped status update (before=${stockBefore}, after=${stockAfter})`);

    // Transition to Cancelled should restore stock
    await db.updateOrderStatus(orderResult.orderId, "Cancelled");
    updatedBook = await db.getBook(book.id);
    stockAfter = updatedBook!.stock;
    assert(stockAfter === stockBefore, `stock restored on Cancelled status update (before=${stockBefore}, after=${stockAfter})`);

    assert((await db.getCart(userId)).length === 0, "cart cleared after checkout");
  }

  // reviews
  await db.upsertReview(book.id, userId, 5, "Loved it.");
  let reviews = await db.getReviewsForBook(book.id);
  assert(reviews.length === 1 && reviews[0].rating === 5, "review created");
  await db.upsertReview(book.id, userId, 3, "Actually, mixed feelings.");
  reviews = await db.getReviewsForBook(book.id);
  assert(reviews.length === 1 && reviews[0].rating === 3, "re-reviewing the same book updates, not duplicates");
  const summary = await db.getRatingSummary(book.id);
  assert(summary.count === 1 && summary.avg === 3, "rating summary reflects the update");

  // admin CRUD
  const newId = await db.createBook({
    title: "Test-Only Title",
    author: "QA Bot",
    description: "Created by the automated check.",
    genre: "Notebooks",
    price_cents: 999,
    stock: 3,
    isbn: "000-0-0000-0000-0",
  });
  assert(!!(await db.getBook(newId)), "admin createBook works");
  await db.updateBook(newId, {
    title: "Updated Title",
    author: "QA Bot",
    description: "Edited.",
    genre: "Notebooks",
    price_cents: 1099,
    stock: 2,
    isbn: "000-0-0000-0000-0",
  });
  const updatedBook = await db.getBook(newId);
  assert(updatedBook?.title === "Updated Title", "admin updateBook works");
  await db.deleteBook(newId);
  assert(!(await db.getBook(newId)), "admin deleteBook works");

  // all orders (admin view)
  const allOrders = await db.getAllOrders();
  assert(allOrders.some((o) => o.user_email === "reader@example.com"), "admin getAllOrders includes the new order");

  // guest conversion tests
  const guestEmail = "guest-check@example.com";
  const guestId = await db.getOrCreateGuestUser("Guest Buyer", guestEmail);
  const guestUser = await db.getUserById(guestId);
  assert(!!guestUser && guestUser.password_hash === "NO_PASSWORD" && guestUser.email_verified, "guest user created with NO_PASSWORD and email_verified=true");

  const upgradedHash = bcrypt.hashSync("upgradedpass123", 10);
  await db.upgradeGuestUser(guestId, "Upgraded Guest", upgradedHash);
  const upgradedUser = await db.getUserById(guestId);
  assert(!!upgradedUser && upgradedUser.name === "Upgraded Guest" && upgradedUser.password_hash === upgradedHash && !upgradedUser.email_verified, "guest user successfully upgraded to standard password account with email_verified=false");

  // password reset database verification tests
  const resetToken = await db.createPasswordResetToken("reader@example.com");
  assert(!!resetToken, "createPasswordResetToken generates a token for existing user");
  const verifiedResetUser = await db.verifyPasswordResetToken(resetToken!);
  assert(!!verifiedResetUser && verifiedResetUser.email === "reader@example.com", "verifyPasswordResetToken returns correct user for valid token");

  const newPasswordHash = bcrypt.hashSync("newsupersecure123", 10);
  await db.resetUserPassword(verifiedResetUser!.id, newPasswordHash);
  const userAfterReset = await db.getUserById(verifiedResetUser!.id);
  assert(!!userAfterReset && userAfterReset.password_hash === newPasswordHash, "resetUserPassword correctly updates user password hash and clears reset token");
  assert(!!userAfterReset && userAfterReset.reset_token === null, "resetUserPassword clears reset_token column");

  // ---------- CLEAN UP ----------
  console.log("Cleaning up test reader and test order data from database...");
  if (!("error" in orderResult)) {
    await db.sql`DELETE FROM order_items WHERE order_id = ${orderResult.orderId}`;
    await db.sql`DELETE FROM orders WHERE id = ${orderResult.orderId}`;
  }
  await db.sql`DELETE FROM reviews WHERE user_id = ${userId}`;
  await db.sql`DELETE FROM users WHERE id = ${userId}`;
  await db.sql`DELETE FROM users WHERE email = ${guestEmail}`;

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
