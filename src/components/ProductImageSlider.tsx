"use client";

import { useState } from "react";
import BookCover from "./BookCover";
import Image from "next/image";

type ProductImageSliderProps = {
  title: string;
  author: string;
  genre: string;
  coverSeed: string;
  coverSeed2?: string | null;
  colorImages?: string | null;
};

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");
}

function Slide({ title, author, genre, seed, isSecondary }: {
  title: string;
  author: string;
  genre: string;
  seed: string;
  isSecondary?: boolean;
}) {
  if (isUrl(seed)) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={seed}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 300px"
        />
      </div>
    );
  }

  return (
    <BookCover
      title={title}
      author={author}
      genre={genre}
      seed={seed}
      isSecondary={isSecondary}
      className="w-full h-full"
    />
  );
}

export default function ProductImageSlider({
  title,
  author,
  genre,
  coverSeed,
  coverSeed2,
  colorImages,
}: ProductImageSliderProps) {
  const [index, setIndex] = useState(0);

  let slides: Array<{ seed: string; label?: string; isSecondary?: boolean }> = [
    { seed: coverSeed },
  ];
  
  if (coverSeed2) {
    slides.push({ seed: coverSeed2 });
  }

  if (colorImages) {
    try {
      const parsed = JSON.parse(colorImages);
      if (Array.isArray(parsed) && parsed.length > 0) {
        slides = parsed.map((item: any) => ({
          seed: item.url,
          label: item.color,
        }));
      }
    } catch (e) {
      console.error("Failed to parse color images in slider:", e);
    }
  }

  const totalSlides = slides.length;

  return (
    <div className="relative group w-full flex flex-col items-center">
      {/* Slider viewport */}
      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-parchment shadow-md ring-1 ring-ink/10">
        <div
          className="flex w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="w-full h-full shrink-0">
              <Slide
                title={title}
                author={author}
                genre={genre}
                seed={slide.seed}
                isSecondary={slide.isSecondary}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setIndex((prev) => (prev - 1 + totalSlides) % totalSlides)}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-cream/80 border border-ink/10 text-ink hover:bg-oxblood hover:text-cream transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm"
          aria-label="Previous image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => setIndex((prev) => (prev + 1) % totalSlides)}
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
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${index === idx ? "bg-oxblood w-5" : "bg-ink/20 hover:bg-ink/40"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide Label / Color Family name */}
      {slides[index]?.label && (
        <span className="text-[10px] tracking-[0.15em] uppercase text-ink-soft/80 mt-2.5 font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
          Color: {slides[index].label}
        </span>
      )}
    </div>
  );
}