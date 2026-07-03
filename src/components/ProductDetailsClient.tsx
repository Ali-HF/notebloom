"use client";

import { useState } from "react";
import ProductImageSlider from "./ProductImageSlider";
import AddToCartButton from "./AddToCartButton";
import StarRating from "./StarRating";
import { parseProductMedia, formatPrice } from "@/lib/cart-utils";
import type { Book } from "@/lib/types";

interface ProductDetailsClientProps {
  book: Book;
  summary: { avg: number; count: number };
  maxQty: number;
}

export default function ProductDetailsClient({
  book,
  summary,
  maxQty,
}: ProductDetailsClientProps) {
  const media = parseProductMedia(book.color_images);
  
  // Set default selected category to the first available category, or empty string
  const [selectedCategory, setSelectedCategory] = useState<string>(
    media.categories[0]?.name || ""
  );

  return (
    <div className="mt-6 grid sm:grid-cols-[350px_1fr] md:grid-cols-[400px_1fr] gap-12">
      {/* Left Column: Image Slider */}
      <div className="w-full h-fit">
        <ProductImageSlider
          title={book.title}
          author={book.author}
          genre={book.genre}
          coverSeed={book.cover_seed}
          coverSeed2={book.cover_seed_2}
          colorImages={book.color_images}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Right Column: Details & Actions */}
      <div className="flex flex-col">
        {/* Genre Pill */}
        <span
          className="w-fit inline-block px-3 py-1 bg-oxblood text-cream text-[10px] tracking-[0.18em] uppercase rounded-full mb-3 font-semibold"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {book.genre}
        </span>

        {/* Title */}
        <h1
          className="mt-1 text-3xl sm:text-4xl leading-tight font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {book.title}
        </h1>

        {/* Author */}
        <p className="mt-1 text-lg text-ink-soft">{book.author}</p>

        {/* Ratings */}
        <div className="mt-3 flex items-center gap-2">
          <StarRating value={summary.avg} size={14} />
          <span className="text-sm text-ink-soft">
            {summary.count > 0
              ? `${summary.avg.toFixed(1)} (${summary.count} ${summary.count === 1 ? "review" : "reviews"})`
              : "No reviews yet"}
          </span>
        </div>

        {/* Description */}
        <p className="mt-6 text-base leading-relaxed text-ink-soft max-w-prose">
          {book.description}
        </p>

        {/* Price */}
        <div
          className="mt-6 text-2xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {formatPrice(book.price_cents)}
        </div>

        {/* Category Option Selector (e.g. Colors) */}
        {media.categories.length > 0 && (
          <div className="mt-6 border-y border-ink/10 py-5">
            <h3
              className="text-[11px] font-bold tracking-[0.15em] text-ink uppercase mb-3"
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              Select Variation / Color
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {media.categories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border active:scale-95 cursor-pointer shadow-sm select-none ${
                      isSelected
                        ? "bg-oxblood text-cream border-oxblood scale-105"
                        : "bg-cream text-ink-soft border-ink/15 hover:border-ink/30 active:bg-ink/5"
                    }`}
                    style={{ fontFamily: "var(--font-stamp)" }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock status & Add to Cart */}
        <div className="mt-6">
          <div className="text-xs mb-3">
            <span
              className={`font-semibold uppercase tracking-wider ${book.stock > 0 ? "text-moss" : "text-oxblood"}`}
              style={{ fontFamily: "var(--font-stamp)" }}
            >
              {book.stock > 0 ? "In-stock" : "Out of stock"}
            </span>
          </div>

          {book.stock > 0 ? (
            <div className="flex items-center gap-4">
              <AddToCartButton
                bookId={book.id}
                bookTitle={book.title}
                showQtySelect={true}
                maxQty={maxQty}
              />
              <span className="text-xs text-ink-soft font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                {book.stock} units available
              </span>
            </div>
          ) : (
            <p className="text-oxblood text-sm font-bold tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>
              SOLD OUT
            </p>
          )}
        </div>

        {/* SKU */}
        <p className="mt-5 text-[10px] text-ink-soft/60" style={{ fontFamily: "var(--font-stamp)" }}>
          SKU: NB-00{book.id} · {book.isbn}
        </p>
      </div>
    </div>
  );
}
