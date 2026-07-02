"use client";

import { useActionState, useState, useRef } from "react";
import { GENRES } from "@/lib/constants";
import type { Book } from "@/lib/types";
import type { BookFormState } from "@/app/actions/admin-actions";

export default function BookForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: BookFormState, formData: FormData) => Promise<BookFormState>;
  initial?: Partial<Book>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  // Parse color images array from initial data
  type ColorImageItem = {
    id: string;
    url?: string;
    file?: File;
    color: string;
    previewUrl?: string;
  };

  const parsedColorImages: ColorImageItem[] = [];
  if (initial?.color_images) {
    try {
      const arr = JSON.parse(initial.color_images);
      if (Array.isArray(arr)) {
        arr.forEach((item, idx) => {
          parsedColorImages.push({
            id: `existing_${idx}`,
            url: item.url,
            color: item.color,
            previewUrl: item.url
          });
        });
      }
    } catch (e) {
      console.error("Failed to parse color_images JSON:", e);
    }
  }

  // Backwards compatibility fallback: if color_images is empty, read cover_seed and cover_seed_2
  if (parsedColorImages.length === 0) {
    if (initial?.cover_seed) {
      parsedColorImages.push({
        id: `existing_0`,
        url: initial.cover_seed,
        color: "Default",
        previewUrl: initial.cover_seed
      });
    }
    if (initial?.cover_seed_2) {
      parsedColorImages.push({
        id: `existing_1`,
        url: initial.cover_seed_2,
        color: "Secondary",
        previewUrl: initial.cover_seed_2
      });
    }
  }

  const [colorImages, setColorImages] = useState<ColorImageItem[]>(parsedColorImages);

  const addColorImage = () => {
    setColorImages(p => [
      ...p,
      {
        id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        color: "",
      }
    ]);
  };

  const handleColorChange = (id: string, color: string) => {
    setColorImages(p => p.map(item => item.id === id ? { ...item, color } : item));
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setColorImages(p => p.map(item => item.id === id ? { ...item, file, previewUrl } : item));
  };

  const deleteColorImage = (id: string) => {
    setColorImages(p => p.filter(item => item.id !== id));
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5 max-w-xl">
      <Field label="Product Name" name="title" defaultValue={initial?.title} required />
      <Field label="Brand" name="author" defaultValue={initial?.author} required />

      <div>
        <label
          htmlFor="description"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          defaultValue={initial?.description}
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="genre"
            className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Category
          </label>
          <select
            id="genre"
            name="genre"
            required
            defaultValue={initial?.genre ?? GENRES[0]}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="SKU"
          name="isbn"
          defaultValue={initial?.isbn}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Price (USD)"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={initial?.price_cents ? (initial.price_cents / 100).toFixed(2) : undefined}
          required
        />
        <Field
          label="Stock"
          name="stock"
          type="number"
          min="0"
          defaultValue={initial?.stock}
          required
        />
      </div>

      {/* Color Images Management Section */}
      <div className="space-y-4 rounded-xl border border-ink/10 p-5 bg-parchment/30">
        <div className="flex justify-between items-center border-b border-ink/10 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>
              Product Color Images
            </h3>
            <p className="text-[11px] text-ink-soft mt-0.5">Upload images and specify their corresponding color family.</p>
          </div>
          <button
            type="button"
            onClick={addColorImage}
            className="px-3.5 py-1.5 rounded-full bg-moss text-cream hover:bg-moss-dark transition-all text-xs uppercase tracking-wider cursor-pointer font-medium"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            + Add Color
          </button>
        </div>

        {/* Hidden inputs to track keys & values for Next Server Action */}
        <input type="hidden" name="color_image_keys" value={colorImages.map(ci => ci.id).join(",")} />

        {colorImages.length === 0 ? (
          <p className="text-xs text-ink-soft/70 py-4 text-center italic">No color images added. Add at least one image.</p>
        ) : (
          <div className="space-y-4">
            {colorImages.map((item, idx) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-cream p-4 rounded-lg border border-ink/5 relative group hover:border-ink/15 transition-all">
                {/* Preview Thumbnail */}
                <div className="w-16 h-16 rounded-md bg-parchment border border-ink/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-ink-soft uppercase text-center font-bold" style={{ fontFamily: "var(--font-stamp)" }}>No Image</span>
                  )}
                </div>

                {/* Form Inputs */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] tracking-wider uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
                      Color Label
                    </label>
                    <input
                      type="text"
                      name={`color_image_color_${item.id}`}
                      value={item.color}
                      required
                      placeholder="e.g. Peach, Mint, Lilac"
                      onChange={(e) => handleColorChange(item.id, e.target.value)}
                      className="w-full rounded border border-ink/20 bg-cream px-2.5 py-1.5 text-xs focus:border-oxblood transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-wider uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
                      Image URL / Path (fallback)
                    </label>
                    <input
                      type="text"
                      name={`color_image_url_${item.id}`}
                      value={item.url || ""}
                      placeholder="e.g. /images/peach_case.png"
                      onChange={(e) => {
                        const url = e.target.value;
                        setColorImages(p => p.map(x => x.id === item.id ? { ...x, url, previewUrl: url } : x));
                      }}
                      className="w-full rounded border border-ink/20 bg-cream px-2.5 py-1.5 text-xs focus:border-oxblood transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-wider uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
                      Upload Image File (Optional)
                    </label>
                    <input
                      type="file"
                      name={`color_image_file_${item.id}`}
                      accept="image/jpeg, image/png, image/webp"
                      onChange={(e) => handleFileChange(item.id, e.target.files?.[0] || null)}
                      className="w-full text-xs text-ink file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-oxblood/10 file:text-oxblood hover:file:bg-oxblood/20 file:cursor-pointer"
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteColorImage(item.id)}
                  className="absolute sm:static right-2 top-2 p-1.5 rounded-full text-oxblood/60 hover:text-oxblood hover:bg-oxblood/10 transition-colors cursor-pointer shrink-0"
                  aria-label="Delete color image"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-oxblood font-semibold">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer font-semibold uppercase tracking-wider"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "SAVING…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  step,
  min,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
      />
    </div>
  );
}
