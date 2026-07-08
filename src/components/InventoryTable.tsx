"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import type { Book } from "@/lib/types";
import BookCover from "@/components/BookCover";
import { parseProductMedia, formatPrice } from "@/lib/cart-utils";
import { deleteBookAction } from "@/app/actions/admin-actions";

export default function InventoryTable({ books }: { books: Book[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="overflow-x-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left text-xs tracking-[0.12em] uppercase text-ink-soft border-b border-ink/15"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            <th className="pb-3 pr-4 font-semibold">Title</th>
            <th className="pb-3 pr-4 font-semibold">Category</th>
            <th className="pb-3 pr-4 font-semibold">Price</th>
            <th className="pb-3 pr-4 font-semibold">Stock</th>
            <th className="pb-3 pr-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => {
            const isExpanded = expandedId === b.id;
            const media = parseProductMedia(b.color_images, b.stock);
            const hasCategories = media.categories.length > 0;

            return (
              <Fragment key={b.id}>
                <tr
                  onClick={() => toggleRow(b.id)}
                  className={`border-b border-ink/10 hover:bg-parchment/30 transition-all cursor-pointer group/row ${
                    isExpanded ? "bg-parchment/15" : "last:border-0"
                  }`}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Chevron Indicator */}
                      <span
                        className={`text-ink-soft/40 group-hover/row:text-oxblood transition-transform duration-300 ${
                          isExpanded ? "rotate-90 text-oxblood" : ""
                        }`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                      <div>
                        <p
                          className="font-semibold text-ink group-hover/row:text-oxblood transition-colors"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {b.title}
                        </p>
                        <p className="text-xs text-ink-soft mt-0.5">{b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-ink-soft font-medium">{b.genre}</td>
                  <td className="py-4 pr-4 font-medium text-ink" style={{ fontFamily: "var(--font-stamp)" }}>
                    {formatPrice(b.price_cents)}
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <span className={b.stock === 0 ? "text-oxblood font-semibold" : "font-medium"}>
                      {b.stock}
                    </span>
                    {/* Stock Level Warning Badges */}
                    {b.stock === 0 && (
                      <span
                        className="ml-2 text-[9px] uppercase font-bold text-oxblood bg-oxblood/10 border border-oxblood/20 px-2 py-0.5 rounded-full"
                        style={{ fontFamily: "var(--font-stamp)" }}
                      >
                        OUT OF STOCK
                      </span>
                    )}
                    {b.stock > 0 && b.stock < 5 && (
                      <span
                        className="ml-2 text-[9px] uppercase font-bold text-brass bg-brass/10 border border-brass/20 px-2 py-0.5 rounded-full"
                        style={{ fontFamily: "var(--font-stamp)" }}
                      >
                        LOW STOCK
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/edit/${b.id}`}
                      className="trail-link text-ink mr-4 font-medium text-xs tracking-wider"
                      style={{ fontFamily: "var(--font-stamp)" }}
                    >
                      EDIT
                    </Link>
                    <form
                      onSubmit={(e) => {
                        if (!confirm(`Are you sure you want to delete "${b.title}"?`)) {
                          e.preventDefault();
                        }
                      }}
                      action={deleteBookAction.bind(null, b.id)}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="trail-link text-oxblood cursor-pointer font-medium text-xs tracking-wider"
                        style={{ fontFamily: "var(--font-stamp)" }}
                      >
                        DELETE
                      </button>
                    </form>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-cream/40">
                    <td colSpan={5} className="py-5 px-6 border-b border-ink/10 bg-cream/[0.15]">
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-ink/5 pb-2">
                          <h4
                            className="text-[10px] tracking-wider uppercase font-bold text-oxblood flex items-center gap-2"
                            style={{ fontFamily: "var(--font-stamp)" }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                            Variations &amp; Stock Breakdown
                          </h4>
                          <span className="text-[10px] text-ink-soft/60" style={{ fontFamily: "var(--font-stamp)" }}>
                            Total Base Stock: {b.stock}
                          </span>
                        </div>

                        {hasCategories ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {media.categories.map((cat, idx) => {
                              const isCatOutOfStock = cat.stock <= 0;
                              const coverSeed = cat.images[0] || b.cover_seed;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 bg-cream border border-ink/5 hover:border-ink/10 rounded-lg shadow-sm transition-all"
                                >
                                  <div className="w-12 h-12 shrink-0 overflow-hidden rounded bg-cream border border-ink/5 relative">
                                    <BookCover
                                      title={b.title}
                                      author={b.author}
                                      genre={b.genre}
                                      seed={coverSeed}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-xs uppercase font-bold text-ink truncate"
                                      style={{ fontFamily: "var(--font-stamp)" }}
                                    >
                                      {cat.name}
                                    </p>
                                    <p className="text-xs text-ink-soft mt-0.5">
                                      Stock:{" "}
                                      <span
                                        className={
                                          isCatOutOfStock
                                            ? "text-oxblood font-bold"
                                            : cat.stock < 5
                                            ? "text-brass font-bold text-[13px]"
                                            : "font-semibold text-ink"
                                        }
                                      >
                                        {cat.stock}
                                      </span>
                                    </p>
                                    <div className="mt-1">
                                      {isCatOutOfStock ? (
                                        <span
                                          className="inline-block text-[8px] uppercase font-bold text-oxblood bg-oxblood/10 border border-oxblood/20 px-1.5 py-0.5 rounded-full"
                                          style={{ fontFamily: "var(--font-stamp)" }}
                                        >
                                          SOLD OUT
                                        </span>
                                      ) : cat.stock < 5 ? (
                                        <span
                                          className="inline-block text-[8px] uppercase font-bold text-brass bg-brass/10 border border-brass/20 px-1.5 py-0.5 rounded-full"
                                          style={{ fontFamily: "var(--font-stamp)" }}
                                        >
                                          LOW STOCK
                                        </span>
                                      ) : (
                                        <span
                                          className="inline-block text-[8px] uppercase font-bold text-moss bg-moss/10 border border-moss/20 px-1.5 py-0.5 rounded-full"
                                          style={{ fontFamily: "var(--font-stamp)" }}
                                        >
                                          IN STOCK
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-4 text-center border border-dashed border-ink/10 rounded-lg">
                            <p className="text-xs text-ink-soft italic">
                              This product does not have any color or custom variations.
                            </p>
                            <p className="text-[10px] text-ink-soft/60 mt-1">
                              All sales will deduct directly from the base stock.
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
