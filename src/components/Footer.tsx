"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BloomMark from "./BloomMark";
import { GENRES } from "@/lib/constants";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-charcoal text-parchment mt-auto border-t border-parchment/10">
      {/* Main Footer Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-parchment/10">
          
          {/* Column 1: About Notebloom (Logo & Story) - Span 5 */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brass-light">
              <BloomMark size={36} />
              <div className="relative h-12 w-48 shrink-0">
                <Image
                  src="/logo-transparent.png"
                  alt="Notebloom Logo"
                  fill
                  priority
                  className="object-contain object-left"
                  style={{ filter: "brightness(0) invert(0.95)" }}
                />
              </div>
            </Link>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-brass-light uppercase" style={{ fontFamily: "var(--font-stamp)" }}>
                Our Philosophy
              </h3>
              <p className="text-sm text-parchment/70 leading-relaxed max-w-md">
                Notebloom was founded on a simple belief: that physical paper and analog writing tools unlock a slower, deeper way of thinking. In a fast-paced digital world, we curate tactile notebooks, smooth-flowing fountain pens, and artful accessories to help you cultivate focus, document memories, and let your ideas bloom.
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links (Browse Categories) - Span 2 */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs tracking-[0.18em] uppercase text-brass-light" style={{ fontFamily: "var(--font-stamp)" }}>
              Browse
            </h3>
            <ul className="space-y-2 text-sm text-parchment/80">
              {GENRES.slice(0, 5).map((g) => (
                <li key={g}>
                  <Link href={`/shop?genre=${encodeURIComponent(g)}`} className="trail-link hover:text-brass-light transition-colors">
                    {g}
                  </Link>
                </li>
              ))}
              {GENRES.length > 5 && (
                <li>
                  <Link href="/shop" className="trail-link hover:text-brass-light transition-colors font-medium text-brass-light">
                    View All Categories →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Customer Care / Info - Span 2 */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs tracking-[0.18em] uppercase text-brass-light" style={{ fontFamily: "var(--font-stamp)" }}>
              Shop & Info
            </h3>
            <ul className="space-y-2 text-sm text-parchment/80 font-body">
              <li>
                <Link href="/shop" className="trail-link hover:text-brass-light transition-colors">All products</Link>
              </li>
              <li>
                <Link href="/account" className="trail-link hover:text-brass-light transition-colors">Your Account</Link>
              </li>
              <li>
                <Link href="/cart" className="trail-link hover:text-brass-light transition-colors">Your Cart</Link>
              </li>
              <li>
                <span className="text-parchment/40 cursor-not-allowed">FAQ & Help</span>
              </li>
              <li>
                <span className="text-parchment/40 cursor-not-allowed">Shipping & Returns</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact - Span 3 */}
          <div className="md:col-span-3 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs tracking-[0.18em] uppercase text-brass-light" style={{ fontFamily: "var(--font-stamp)" }}>
                Stay Inspired
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed">
                Subscribe for journaling prompts, new stationery releases, and exclusive community events.
              </p>
              
              {subscribed ? (
                <div className="bg-moss/20 border border-moss/40 text-parchment text-xs p-3 rounded-md">
                  ✓ Thank you! You've been subscribed to our newsletter.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <input
                    type="email"
                    required
                    placeholder="your.email@address.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-parchment/10 text-parchment border border-parchment/20 px-3 py-2 rounded focus:outline-none focus:border-brass-light placeholder:text-parchment/40 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full text-xs uppercase bg-brass hover:bg-brass-light text-charcoal font-semibold py-2 rounded transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-stamp)" }}
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-2 text-xs text-parchment/60">
              <p>Email: <a href="mailto:hello@notebloom.com" className="hover:text-brass-light transition-colors">hello@notebloom.com</a></p>
              <p>Studio: Portland, Oregon</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-parchment/50">
          <div>
            © {new Date().getFullYear()} Notebloom Stationery. Crafted for focus.
          </div>
          <div className="italic text-center sm:text-right">
            Demo storefront — no real orders or newsletter subscriptions are processed.
          </div>
        </div>
      </div>
    </footer>
  );
}
