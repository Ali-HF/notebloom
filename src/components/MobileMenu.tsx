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
    <>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="sm:hidden p-2 text-ink hover:text-oxblood transition-colors focus:outline-none cursor-pointer"
        aria-label="Open navigation menu"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#221d18]/50 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[60] h-screen w-80 max-w-[90vw] bg-[#faf6ec]
                    shadow-2xl border-l border-ink/10 flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 shrink-0">
          <span
            className="text-xs font-bold tracking-widest text-ink-soft uppercase"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Menu
          </span>
          <button
            onClick={closeMenu}
            className="p-1 text-ink-soft hover:text-oxblood transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-1">

          {/* Search */}
          <form action="/shop" onSubmit={closeMenu} className="mb-5">
            <div className="relative">
              <input
                name="q"
                type="search"
                placeholder="Search notebooks, pens, washi..."
                className="w-full rounded-full border border-ink/20 bg-[#ede4d3] px-4 py-2.5 text-sm text-ink
                           placeholder:text-ink-soft/60 focus:border-oxblood focus:outline-none transition-colors"
              />
              <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-oxblood">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav links */}
          <nav className="flex flex-col" style={{ fontFamily: "var(--font-stamp)" }}>

            <Link href="/shop" onClick={closeMenu}
              className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
              <span>SHOP ALL</span>
              <span className="text-ink/30 text-xs">→</span>
            </Link>

            <Link href="/my-orders" onClick={closeMenu}
              className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
              <span>MY ORDERS</span>
              <span className="text-ink/30 text-xs">→</span>
            </Link>

            <Link href="/cart" onClick={closeMenu}
              className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
              <span>CART</span>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-oxblood text-cream text-[10px] px-1.5 font-bold">
                    {count}
                  </span>
                )}
                <span className="text-ink/30 text-xs">→</span>
              </div>
            </Link>

            {session?.user ? (
              <>
                <Link href="/account" onClick={closeMenu}
                  className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
                  <span>MY ACCOUNT</span>
                  <span className="text-ink/30 text-xs">→</span>
                </Link>

                {session.user.isAdmin && (
                  <Link href="/admin" onClick={closeMenu}
                    className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
                    <span>ADMIN PANEL</span>
                    <span className="text-ink/30 text-xs">→</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMenu}
                  className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
                  <span>LOG IN</span>
                  <span className="text-ink/30 text-xs">→</span>
                </Link>
                <Link href="/signup" onClick={closeMenu}
                  className="flex items-center justify-between py-3.5 border-b border-ink/8 text-sm font-semibold text-ink hover:text-oxblood transition-colors">
                  <span>SIGN UP</span>
                  <span className="text-ink/30 text-xs">→</span>
                </Link>
              </>
            )}

            {/* Categories */}
            <div className="mt-5 mb-2">
              <p className="text-[10px] font-bold tracking-widest text-ink-soft uppercase mb-3">
                Shop by Category
              </p>
              <div className="flex flex-col">
                {GENRES.map((g) => (
                  <Link
                    key={g}
                    href={`/shop?genre=${encodeURIComponent(g)}`}
                    onClick={closeMenu}
                    className="flex items-center justify-between py-2.5 border-b border-ink/5 text-sm text-ink hover:text-oxblood transition-colors"
                  >
                    <span>{g}</span>
                    <span className="text-ink/25 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Log out pinned to bottom */}
        {session?.user && (
          <div className="px-6 py-5 border-t border-ink/10 shrink-0">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-full border border-oxblood/30 text-oxblood
                           hover:bg-oxblood hover:text-cream transition-all text-sm font-semibold
                           flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                style={{ fontFamily: "var(--font-stamp)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                LOG OUT
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}