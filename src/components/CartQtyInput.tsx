"use client";

export default function CartQtyInput({
  bookId,
  currentQty,
  stock,
  onChange,
}: {
  bookId: number;
  currentQty: number;
  stock: number;
  onChange?: (newQty: number) => void;
}) {
  const handleDecrement = () => {
    if (currentQty <= 1) return;
    if (onChange) onChange(currentQty - 1);
  };

  const handleIncrement = () => {
    if (currentQty >= stock) return;
    if (onChange) onChange(currentQty + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center rounded-md border border-brass bg-cream overflow-hidden"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentQty <= 1}
          className="px-3 py-1.5 hover:bg-parchment-dark/30 active:scale-95 active:bg-parchment-dark/50 transition-all text-ink text-sm border-r border-brass font-bold disabled:opacity-40 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          -
        </button>
        <span className="px-4 py-1.5 text-sm font-semibold text-ink bg-transparent select-none min-w-[36px] text-center">
          {currentQty}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentQty >= stock}
          className="px-3 py-1.5 hover:bg-parchment-dark/30 active:scale-95 active:bg-parchment-dark/50 transition-all text-ink text-sm border-l border-brass font-bold disabled:opacity-40 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
