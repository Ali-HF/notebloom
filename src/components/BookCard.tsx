import Link from "next/link";
import BookCover from "./BookCover";
import { formatPrice } from "@/lib/cart-utils";
import type { Book } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

export default function BookCard({ book }: { book: Book }) {
  return (
    <div className="group flex flex-col bg-white border border-[#ddd0b8] rounded-[10px] overflow-hidden transition-all duration-200 hover:shadow-[0_4px_20px_rgba(32,40,58,0.12)] cursor-pointer">
      <div className="relative w-full h-[180px] overflow-hidden shrink-0">
        <BookCover
          title={book.title}
          author={book.author}
          genre={book.genre}
          seed={book.cover_seed}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-white text-center px-4 text-sm font-semibold font-display line-clamp-2 leading-tight">
            {book.title}
          </span>
          <Link
            href={`/shop/${book.id}`}
            className="px-4 py-1.5 bg-white/15 border border-white rounded-[4px] text-white text-[11px] font-bold tracking-wider hover:bg-white/25 transition-colors uppercase"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <Link href={`/shop/${book.id}`} className="block">
          <h3
            className="text-[14px] font-medium text-ink leading-tight line-clamp-2 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {book.title}
          </h3>
        </Link>
        <p className="text-[11px] text-ink-soft/80 italic mb-3">{book.author}</p>

        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          <div className="text-[13px] font-semibold text-ink" style={{ fontFamily: "var(--font-stamp)" }}>
            {formatPrice(book.price_cents)}
          </div>
          {book.stock > 0 ? (
            <AddToCartButton bookId={book.id} bookTitle={book.title} />
          ) : (
            <span className="text-[10px] text-oxblood font-bold uppercase tracking-wider bg-oxblood/10 px-2 py-0.5 rounded" style={{ fontFamily: "var(--font-stamp)" }}>
              SOLD OUT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}