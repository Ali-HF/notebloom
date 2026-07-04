"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "./FilterBar";
import BookCard from "./BookCard";
import BloomMark from "./BloomMark";
import type { Book } from "@/lib/types";

type BookWithSales = Book & { sales?: number };

export default function ShopClient({
  initialBooks,
  initialGenre = "",
  initialSort = "best",
  q = "",
}: {
  initialBooks: BookWithSales[];
  initialGenre?: string;
  initialSort?: string;
  q?: string;
}) {
  const searchParams = useSearchParams();

  // Keep track of active genre & sort in client state
  const [genre, setGenre] = useState(initialGenre);
  const [sort, setSort] = useState(initialSort);

  // Sync state with URL search params when they change (e.g. back button)
  useEffect(() => {
    setGenre(searchParams.get("genre") || "");
    setSort(searchParams.get("sort") || "best");
  }, [searchParams]);

  // Handle updates to URL query string shallowly (no server roundtrip)
  const updateUrl = (newGenre: string, newSort: string) => {
    const params = new URLSearchParams(window.location.search);
    
    if (newGenre) {
      params.set("genre", newGenre);
    } else {
      params.delete("genre");
    }

    if (newSort && newSort !== "best") {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState(null, "", newUrl);
  };

  const handleGenreChange = (newGenre: string) => {
    setGenre(newGenre);
    updateUrl(newGenre, sort);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    updateUrl(genre, newSort);
  };

  // Perform in-memory filter and sort instantly (0ms latency!)
  const processedBooks = useMemo(() => {
    let result = [...initialBooks];

    // 1. Filter by Search Query (if any)
    if (q) {
      const term = q.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term)
      );
    }

    // 2. Filter by Genre
    if (genre) {
      const targetGenre = genre.toLowerCase();
      result = result.filter((b) => b.genre.toLowerCase() === targetGenre);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sort === "price-asc") {
        return a.price_cents - b.price_cents;
      }
      if (sort === "price-desc") {
        return b.price_cents - a.price_cents;
      }
      if (sort === "new") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // "best" - sort by sales descending
      const salesA = a.sales || 0;
      const salesB = b.sales || 0;
      if (salesB !== salesA) {
        return salesB - salesA;
      }
      // fallback to created_at
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [initialBooks, genre, sort, q]);

  return (
    <>
      <FilterBar
        genre={genre}
        q={q}
        sort={sort}
        count={processedBooks.length}
        onGenreChange={handleGenreChange}
        onSortChange={handleSortChange}
      />

      {/* Grid */}
      <div>
        {processedBooks.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 gap-4">
            <BloomMark size={40} />
            <p className="text-ink-soft max-w-sm">
              Nothing blooming here. Try a different category or clear your search.
            </p>
            <button
              onClick={() => {
                handleGenreChange("");
                handleSortChange("best");
              }}
              className="trail-link text-oxblood cursor-pointer font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-fadeIn">
            {processedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
