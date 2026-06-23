"use client";

import { useState } from "react";
import BookCover from "./BookCover";

type ProductImageSliderProps = {
  title: string;
  author: string;
  genre: string;
  coverSeed: string;
  coverSeed2?: string | null;
};

export default function ProductImageSlider({
  title,
  author,
  genre,
  coverSeed,
  coverSeed2,
}: ProductImageSliderProps) {
  const [index, setIndex] = useState(0);

  const totalSlides = 2;

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative group w-full flex flex-col items-center">
      {/* Slider viewport */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-parchment shadow-md ring-1 ring-ink/10">
        <div 
          className="flex w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {/* Slide 1 */}
          <div className="w-full h-full shrink-0">
            <BookCover
              title={title}
              author={author}
              genre={genre}
              seed={coverSeed}
              className="w-full h-full"
            />
          </div>

          {/* Slide 2 */}
          <div className="w-full h-full shrink-0">
            <BookCover
              title={title}
              author={author}
              genre={genre}
              seed={coverSeed2 || coverSeed}
              isSecondary={!coverSeed2}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-cream/80 border border-ink/10 text-ink hover:bg-oxblood hover:text-cream transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm"
          aria-label="Previous image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-cream/80 border border-ink/10 text-ink hover:bg-oxblood hover:text-cream transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm"
          aria-label="Next image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === idx ? "bg-oxblood w-5" : "bg-ink/20 hover:bg-ink/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
