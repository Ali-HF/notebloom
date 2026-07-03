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

  const variationSelector = media.categories.length > 0 && (
    <div className="border-y border-ink/10 py-4 my-2 sm:my-6">
      <h3
        className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-ink uppercase mb-2.5"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        Select Variation / Color
      </h3>
      <div className="flex flex-wrap gap-2">
        {media.categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border active:scale-95 cursor-pointer shadow-sm select-none ${
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
  );

  return (
    <div className="mt-4 sm:mt-6 grid sm:grid-cols-[350px_1fr] md:grid-cols-[400px_1fr] gap-6 sm:gap-12">
      {/* Left Column: Image Slider */}
      <div className="w-full h-fit flex flex-col gap-2">
        <ProductImageSlider
          title={book.title}
          author={book.author}
          genre={book.genre}
          coverSeed={book.cover_seed}
          coverSeed2={book.cover_seed_2}
          colorImages={book.color_images}
          selectedCategory={selectedCategory}
        />
        {/* Mobile-only Variation Selector: directly below picture */}
        <div className="block sm:hidden">
          {variationSelector}
        </div>
      </div>

      {/* Right Column: Details & Actions */}
      <div className="flex flex-col bg-cream border border-ink/10 rounded-2xl p-5 sm:p-0 sm:bg-transparent sm:border-0 shadow-sm sm:shadow-none">
        {/* Genre Pill */}
        <span
          className="w-fit inline-block px-3 py-1 bg-oxblood text-cream text-[10px] tracking-[0.18em] uppercase rounded-full mb-3 font-semibold"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {book.genre}
        </span>

        {/* Title */}
        <h1
          className="mt-1 text-2xl sm:text-4xl leading-tight font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {book.title}
        </h1>

        {/* Author */}
        <p className="mt-1 text-base sm:text-lg text-ink-soft">{book.author}</p>

        {/* Ratings */}
        <div className="mt-3 flex items-center gap-2">
          <StarRating value={summary.avg} size={14} />
          <span className="text-xs sm:text-sm text-ink-soft">
            {summary.count > 0
              ? `${summary.avg.toFixed(1)} (${summary.count} ${summary.count === 1 ? "review" : "reviews"})`
              : "No reviews yet"}
          </span>
        </div>

        {/* Price */}
        <div
          className="mt-4 sm:mt-6 text-xl sm:text-2xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {formatPrice(book.price_cents)}
        </div>

        {/* Desktop-only Variation Selector */}
        <div className="hidden sm:block">
          {variationSelector}
        </div>

        {/* Stock status & Add to Cart */}
        <div className="mt-5 sm:mt-6">
          {(() => {
            const activeCat = media.categories.find(
              (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
            );
            const activeStock = activeCat ? activeCat.stock : book.stock;
            const isAvailable = activeStock > 0;
            const computedMaxQty = Math.min(activeStock, 10);

            return (
              <>
                <div className="text-xs mb-3">
                  <span
                    className={`font-semibold uppercase tracking-wider ${isAvailable ? "text-moss" : "text-oxblood"}`}
                    style={{ fontFamily: "var(--font-stamp)" }}
                  >
                    {isAvailable ? "In-stock" : "Out of stock"}
                  </span>
                </div>

                {isAvailable ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <AddToCartButton
                      bookId={book.id}
                      bookTitle={book.title}
                      showQtySelect={true}
                      maxQty={computedMaxQty}
                      selectedCategory={selectedCategory}
                    />
                    <span className="text-xs text-ink-soft/80 font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                      {activeStock} units available
                    </span>
                  </div>
                ) : (
                  <p className="text-oxblood text-sm font-bold tracking-wider animate-pulse" style={{ fontFamily: "var(--font-stamp)" }}>
                    SOLD OUT
                  </p>
                )}
              </>
            );
          })()}
        </div>

        {/* SKU */}
        <p className="mt-5 text-[10px] text-ink-soft/60 border-b border-ink/10 pb-4 mb-4" style={{ fontFamily: "var(--font-stamp)" }}>
          SKU: NB-00{book.id} · {book.isbn}
        </p>

        {/* Description */}
        <div className="mt-2">
          <h4 className="text-[10px] font-bold tracking-widest text-ink uppercase mb-2" style={{ fontFamily: "var(--font-stamp)" }}>
            Product Description
          </h4>
          <p className="text-sm leading-relaxed text-ink-soft max-w-prose">
            {book.description}
          </p>
        </div>
      </div>
    </div>
  );
}
