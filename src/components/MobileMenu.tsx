"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth-actions";
import { GENRES } from "@/lib/constants";

type MobileMenuProps = {
  session: any;
  count: number;
};

export default function MobileMenu({ session, count }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="sm:hidden flex items-center">
      {/* Hamburger Toggle Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-ink-soft hover:text-oxblood transition-colors focus:outline-none cursor-pointer"
        aria-label="Open navigation menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Drawer Overlay (Backdrop) & Drawer Sidebar */}
      {isOpen && (
        <>
          {/* Drawer Overlay (Backdrop) */}
          <div
            className="fixed inset-0 z-50 bg-[#221d18]/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeMenu}
          />

          {/* Drawer Sidebar */}
          <div
            className="fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] bg-[#faf6ec] p-6 shadow-2xl border-l border-ink/10 flex flex-col overflow-y-auto"
          >
            {/* Header inside drawer */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink/10">
              <span className="font-bold text-xs tracking-widest text-ink-soft uppercase" style={{ fontFamily: "var(--font-stamp)" }}>
                Menu
              </span>
              <button
                onClick={closeMenu}
                className="p-1 text-ink-soft hover:text-oxblood transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search form in mobile drawer */}
            <form action="/shop" onSubmit={closeMenu} className="mb-6">
              <label htmlFor="mobile-search" className="sr-only">
                Search books
              </label>
              <div className="relative">
                <input
                  id="mobile-search"
                  name="q"
                  type="search"
                  placeholder="Search notebooks, pens, washi..."
                  className="w-full rounded-full border border-ink/20 bg-[#ede4d3] px-4 py-2 text-sm text-ink
                             placeholder:text-ink-soft/70 focus:border-oxblood focus:outline-none transition-colors"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/70 hover:text-oxblood">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-5 text-base font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
              <Link href="/shop" onClick={closeMenu} className="trail-link py-1 border-b border-ink/5 flex items-center justify-between text-ink">
                <span>SHOP ALL</span>
                <span className="text-xs opacity-50">→</span>
              </Link>

              <Link href="/my-orders" onClick={closeMenu} className="trail-link py-1 border-b border-ink/5 flex items-center justify-between text-ink">
                <span>MY ORDERS</span>
                <span className="text-xs opacity-50">→</span>
              </Link>

              {/* Categories list section */}
              <div className="py-2 border-b border-ink/5">
                <span className="font-bold text-xs tracking-widest text-ink-soft uppercase block mb-3">
                  Shop By Category
                </span>
                <div className="flex flex-col gap-3 pl-2">
                  {GENRES.map((g) => (
                    <Link
                      key={g}
                      href={`/shop?genre=${encodeURIComponent(g)}`}
                      onClick={closeMenu}
                      className="text-sm font-medium text-ink hover:text-oxblood transition-colors flex items-center justify-between"
                    >
                      <span>{g}</span>
                      <span className="text-[10px] opacity-35">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/cart" onClick={closeMenu} className="trail-link py-1 border-b border-ink/5 flex items-center justify-between text-ink">
                <span>CART</span>
                <div className="flex items-center gap-1.5">
                  {count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-oxblood text-cream text-[10px] px-1 font-bold">
                      {count}
                    </span>
                  )}
                  <span className="text-xs opacity-50">→</span>
                </div>
              </Link>

              {session?.user ? (
                <>
                  <Link href="/account" onClick={closeMenu} className="trail-link py-1 border-b border-ink/5 flex items-center justify-between text-ink">
                    <span>ACCOUNT</span>
                    <span className="text-xs opacity-50">→</span>
                  </Link>

                  {session.user.isAdmin && (
                    <Link href="/admin" onClick={closeMenu} className="trail-link py-1 border-b border-ink/5 flex items-center justify-between text-ink">
                      <span>ADMIN PANEL</span>
                      <span className="text-xs opacity-50">→</span>
                    </Link>
                  )}

                  <form action={logoutAction} onSubmit={closeMenu} className="mt-4">
                    <button
                      type="submit"
                      className="w-full text-left py-2.5 px-4 rounded-full border border-oxblood/20 text-oxblood hover:bg-oxblood hover:text-cream transition-all text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      <span>LOG OUT</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full text-center py-2.5 px-4 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark transition-all text-sm font-semibold"
                  >
                    LOG IN
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="w-full text-center py-2.5 px-4 rounded-full border border-ink/20 text-ink hover:border-oxblood transition-all text-sm font-semibold"
                  >
                    SIGN UP
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
