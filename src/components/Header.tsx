import Link from "next/link";
import { auth } from "@/lib/auth";
import { cartCount } from "@/lib/db";
import Logo from "./Logo";
import { logoutAction } from "@/app/actions/auth-actions";
import { cookies } from "next/headers";
import MobileMenu from "./MobileMenu";
import CartBadge from "./CartBadge";

export default async function Header() {
  const session = await auth();

  let count = 0;
  if (session?.user?.id) {
    count = await cartCount(Number(session.user.id));
  } else {
    try {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        const parsed = JSON.parse(cartCookie);
        if (Array.isArray(parsed)) {
          count = parsed.reduce((sum, item: any) => sum + (Number(item.quantity) || 0), 0);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between gap-4">
          <Logo />

          <form action="/shop" className="hidden md:flex flex-1 max-w-md mx-auto">
            <label htmlFor="header-search" className="sr-only">
              Search notebooks, pens, washi...
            </label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Search notebooks, pens, washi..."
              className="w-full rounded-full border border-ink/20 bg-parchment px-5 py-2 text-sm
                         placeholder:text-ink-soft/70 focus:border-oxblood transition-colors"
            />
          </form>

          <nav className="flex items-center gap-5 text-sm" style={{ fontFamily: "var(--font-stamp)" }}>
            <Link href="/shop" className="trail-link hidden sm:inline">
              SHOP
            </Link>

            <Link href="/my-orders" className="trail-link hidden sm:inline">
              MY ORDERS
            </Link>

            {/* Cart — desktop */}
            <Link href="/cart" className="trail-link relative hidden sm:flex items-center gap-1.5" aria-label="Cart">
              <CartIcon />
              <span className="hidden sm:inline">CART</span>
              <CartBadge initialCount={count} />
            </Link>

            {/* Admin section — desktop */}
            <div className="hidden sm:flex items-center gap-4">
              {session?.user?.isAdmin ? (
                <>
                  <Link href="/admin" className="trail-link">
                    ADMIN
                  </Link>
                  <form action={logoutAction}>
                    <button type="submit" className="trail-link cursor-pointer">
                      LOG OUT
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login?next=/admin" className="trail-link text-ink-soft/60 hover:text-ink transition-colors text-xs">
                  ADMIN
                </Link>
              )}
            </div>

            {/* Cart icon — mobile only */}
            <Link href="/cart" className="relative sm:hidden flex items-center" aria-label="Cart">
              <CartIcon />
              <div className="absolute -top-2 -right-2">
                <CartBadge initialCount={count} />
              </div>
            </Link>

            <MobileMenu session={session} />
          </nav>
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 8h14l-1.2 10.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}