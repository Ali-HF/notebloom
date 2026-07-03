import { useState, useEffect } from "react";
import BookCover from "./BookCover";
import Image from "next/image";
import { parseProductMedia } from "@/lib/cart-utils";

type ProductImageSliderProps = {
  title: string;
  author: string;
  genre: string;
  coverSeed: string;
  coverSeed2?: string | null;
  colorImages?: string | null;
  selectedCategory?: string;
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
          sizes="(max-width: 640px) 100vw, 600px"
          priority
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
  selectedCategory,
}: ProductImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Reset slider index when category changes
  useEffect(() => {
    setIndex(0);
  }, [selectedCategory]);

  const media = parseProductMedia(colorImages);
  let slides: Array<{ seed: string; label?: string; isSecondary?: boolean }> = [];

  // Generic pictures come first
  media.generic_pictures.forEach((url) => {
    slides.push({ seed: url, label: "Generic" });
  });

  // Then add unique category pictures
  if (selectedCategory) {
    const activeCat = media.categories.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (activeCat) {
      activeCat.images.forEach((url) => {
        slides.push({ seed: url, label: activeCat.name });
      });
    }
  } else {
    // Show all category pictures
    media.categories.forEach((cat) => {
      cat.images.forEach((url) => {
        slides.push({ seed: url, label: cat.name });
      });
    });
  }

  // Fallback to cover seeds if no images resolved
  if (slides.length === 0) {
    slides.push({ seed: coverSeed });
    if (coverSeed2) {
      slides.push({ seed: coverSeed2 });
    }
  }

  const totalSlides = slides.length;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setIndex((prev) => (prev + 1) % totalSlides);
    } else if (isRightSwipe) {
      setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  // Lightbox key listeners
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight" && zoomScale === 1) {
        setIndex((prev) => (prev + 1) % totalSlides);
      } else if (e.key === "ArrowLeft" && zoomScale === 1) {
        setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, zoomScale, totalSlides]);

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setDragOffset({ x: 0, y: 0 });
  };

  const toggleZoom = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
      setDragOffset({ x: 0, y: 0 });
    } else {
      setZoomScale(2.5);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoomScale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || zoomScale === 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPanPosition({ x: newX, y: newY });
    setDragOffset({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative group w-full flex flex-col items-center">
      {/* Slider viewport */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => setIsLightboxOpen(true)}
        className="relative w-full aspect-square overflow-hidden rounded-xl bg-parchment shadow-md ring-1 ring-ink/10 select-none touch-pan-y cursor-zoom-in group/viewport"
      >
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

        {/* Hover/Tap Zoom Badge */}
        <div className="absolute top-3 right-3 bg-cream/90 backdrop-blur-sm border border-ink/10 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest text-ink uppercase flex items-center gap-1 shadow-sm opacity-80 sm:opacity-0 group-hover/viewport:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ fontFamily: "var(--font-stamp)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Zoom
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-cream/85 border border-ink/10 text-ink hover:bg-oxblood hover:text-cream transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm"
          aria-label="Previous image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIndex((prev) => (prev + 1) % totalSlides);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-cream/85 border border-ink/10 text-ink hover:bg-oxblood hover:text-cream transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm"
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

      {/* Interactive Zoom Lightbox Overlay */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-ink/98 backdrop-blur-xl z-[999] flex flex-col justify-between py-6 px-4 animate-fadeIn">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto z-10">
            <span className="text-cream/50 text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-stamp)" }}>
              {index + 1} / {totalSlides}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => toggleZoom(e)}
                className="px-3 py-1.5 rounded-full bg-cream/10 border border-cream/10 hover:bg-cream/20 text-cream text-[10px] tracking-widest font-bold uppercase transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                style={{ fontFamily: "var(--font-stamp)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {zoomScale > 1 ? (
                    <>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </>
                  ) : (
                    <>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </>
                  )}
                </svg>
                {zoomScale > 1 ? "Zoom Out" : "Zoom In"}
              </button>
              <button
                onClick={closeLightbox}
                className="w-8 h-8 rounded-full bg-cream/10 border border-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                aria-label="Close details"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Interactive Zoom Panning Area */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={(e) => toggleZoom(e)}
            className="relative w-full flex-1 flex items-center justify-center overflow-hidden touch-none my-4 cursor-zoom-in"
          >
            <div
              className={`relative w-full max-w-[90vw] md:max-w-2xl aspect-square select-none transition-transform duration-300 ease-out`}
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
                transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
            >
              <Slide
                title={title}
                author={author}
                genre={genre}
                seed={slides[index].seed}
                isSecondary={slides[index].isSecondary}
              />
            </div>

            {/* Lightbox Navigation Arrows */}
            {zoomScale === 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-cream/5 border border-cream/10 text-cream hover:bg-cream/20 transition-all active:scale-95 cursor-pointer"
                  aria-label="Previous image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((prev) => (prev + 1) % totalSlides);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-cream/5 border border-cream/10 text-cream hover:bg-cream/20 transition-all active:scale-95 cursor-pointer"
                  aria-label="Next image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer & Thumbnail list */}
          <div className="w-full max-w-4xl mx-auto z-10 flex flex-col items-center gap-4">
            {/* Horizontal thumbnail selector */}
            <div className="flex gap-2.5 overflow-x-auto max-w-full px-2 py-1 scrollbar-thin">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIndex(idx);
                    setZoomScale(1);
                    setPanPosition({ x: 0, y: 0 });
                    setDragOffset({ x: 0, y: 0 });
                  }}
                  className={`relative w-12 h-12 rounded-md overflow-hidden bg-parchment border-2 transition-all shrink-0 active:scale-95 cursor-pointer ${
                    index === idx ? "border-oxblood scale-105" : "border-cream/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Slide
                    title={title}
                    author={author}
                    genre={genre}
                    seed={slide.seed}
                    isSecondary={slide.isSecondary}
                  />
                </button>
              ))}
            </div>

            {/* Slide color description */}
            {slides[index]?.label && (
              <span className="text-[10px] tracking-[0.2em] uppercase text-cream/70 font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                {slides[index].label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}