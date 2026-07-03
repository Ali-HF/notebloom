"use client";

import { useActionState, useState } from "react";
import { GENRES } from "@/lib/constants";
import type { Book } from "@/lib/types";
import type { BookFormState } from "@/app/actions/admin-actions";
import { parseProductMedia } from "@/lib/cart-utils";

interface PictureItem {
  id: string;
  url?: string;
  file?: File;
  previewUrl?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  images: PictureItem[];
}

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

  // Parse initial media using our robust helper
  const initialMedia = parseProductMedia(initial?.color_images);

  // Map parsed media to state structure
  const initialGeneric: PictureItem[] = initialMedia.generic_pictures.map((url, idx) => ({
    id: `existing_gen_${idx}`,
    url,
    previewUrl: url
  }));

  const initialCategories: CategoryItem[] = initialMedia.categories.map((cat, catIdx) => ({
    id: `existing_cat_${catIdx}`,
    name: cat.name,
    images: cat.images.map((url, imgIdx) => ({
      id: `existing_cat_${catIdx}_img_${imgIdx}`,
      url,
      previewUrl: url
    }))
  }));

  // Backwards compatibility: if empty categories/generic but we have cover_seed
  if (initialGeneric.length === 0 && initialCategories.length === 0 && initial?.cover_seed) {
    initialGeneric.push({
      id: "existing_gen_0",
      url: initial.cover_seed,
      previewUrl: initial.cover_seed
    });
    if (initial?.cover_seed_2) {
      initialGeneric.push({
        id: "existing_gen_1",
        url: initial.cover_seed_2,
        previewUrl: initial.cover_seed_2
      });
    }
  }

  const [genericPictures, setGenericPictures] = useState<PictureItem[]>(initialGeneric);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // --- Generic Pictures Helpers ---
  const addGenericPicture = () => {
    setGenericPictures((p) => [
      ...p,
      { id: `new_gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }
    ]);
  };

  const handleGenericFileChange = (id: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setGenericPictures((prev) =>
      prev.map((item) => (item.id === id ? { ...item, file, previewUrl } : item))
    );
  };

  const handleGenericUrlChange = (id: string, url: string) => {
    setGenericPictures((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url, previewUrl: url } : item))
    );
  };

  const deleteGenericPicture = (id: string) => {
    setGenericPictures((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Categories Helpers ---
  const addCategory = () => {
    setCategories((p) => [
      ...p,
      {
        id: `new_cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: "",
        images: []
      }
    ]);
  };

  const handleCategoryNameChange = (catId: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, name } : c))
    );
  };

  const deleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  // --- Category Pictures Helpers ---
  const addCategoryPicture = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          images: [
            ...c.images,
            { id: `new_catimg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }
          ]
        };
      })
    );
  };

  const handleCategoryFileChange = (catId: string, imgId: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          images: c.images.map((img) => (img.id === imgId ? { ...img, file, previewUrl } : img))
        };
      })
    );
  };

  const handleCategoryUrlChange = (catId: string, imgId: string, url: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          images: c.images.map((img) => (img.id === imgId ? { ...img, url, previewUrl: url } : img))
        };
      })
    );
  };

  const deleteCategoryPicture = (catId: string, imgId: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          images: c.images.filter((img) => img.id !== imgId)
        };
      })
    );
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6 max-w-2xl">
      <Field label="Product Name" name="title" defaultValue={initial?.title} required />
      <Field label="Brand / Author" name="author" defaultValue={initial?.author} required />

      <div>
        <label
          htmlFor="description"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5 font-bold"
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
            className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5 font-bold"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Category Genre
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
        <Field label="SKU" name="isbn" defaultValue={initial?.isbn} />
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

      {/* --- 1. Thumbnail Section (Cover) --- */}
      <div className="space-y-4 rounded-xl border border-ink/10 p-5 bg-parchment/30">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider border-b border-ink/10 pb-2" style={{ fontFamily: "var(--font-stamp)" }}>
          Thumbnail Picture (Displays on Shop Grid)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] tracking-wider uppercase text-ink-soft block mb-1 font-bold" style={{ fontFamily: "var(--font-stamp)" }}>
              Upload Thumbnail File
            </label>
            <input
              type="file"
              name="cover_file"
              accept="image/jpeg, image/png, image/webp"
              className="w-full text-xs text-ink file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-oxblood/10 file:text-oxblood hover:file:bg-oxblood/20 file:cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-wider uppercase text-ink-soft block mb-1 font-bold" style={{ fontFamily: "var(--font-stamp)" }}>
              Or Thumbnail URL (fallback)
            </label>
            <input
              type="text"
              name="cover_seed"
              defaultValue={initial?.cover_seed}
              placeholder="e.g. /images/strawberry_washi.png"
              className="w-full rounded border border-ink/20 bg-cream px-2.5 py-1.5 text-xs focus:border-oxblood transition-colors"
            />
          </div>
        </div>
      </div>

      {/* --- 2. Generic Pictures Section --- */}
      <div className="space-y-4 rounded-xl border border-ink/10 p-5 bg-parchment/30">
        <div className="flex justify-between items-center border-b border-ink/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>
              Generic Pictures (Common to All Categories)
            </h3>
            <p className="text-[10px] text-ink-soft mt-0.5">These pictures will be shown for every color/variation.</p>
          </div>
          <button
            type="button"
            onClick={addGenericPicture}
            className="px-3 py-1 rounded-full bg-moss text-cream hover:bg-moss-dark transition-all text-xs uppercase tracking-wider cursor-pointer font-bold"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            + Add Generic
          </button>
        </div>

        {/* Hidden field to pass generic keys */}
        <input type="hidden" name="generic_picture_keys" value={genericPictures.map((p) => p.id).join(",")} />

        {genericPictures.length === 0 ? (
          <p className="text-xs text-ink-soft/70 py-2 text-center italic">No generic pictures added.</p>
        ) : (
          <div className="space-y-3">
            {genericPictures.map((item) => (
              <div key={item.id} className="flex gap-3 items-center bg-cream p-3 rounded-lg border border-ink/5 relative">
                <div className="w-12 h-12 rounded bg-parchment border border-ink/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-ink-soft font-bold">No Image</span>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    name={`generic_file_${item.id}`}
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => handleGenericFileChange(item.id, e.target.files?.[0] || null)}
                    className="w-full text-[10px] text-ink file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:bg-oxblood/10 file:text-oxblood"
                  />
                  <input
                    type="text"
                    name={`generic_url_${item.id}`}
                    value={item.url || ""}
                    placeholder="Fallback URL path"
                    onChange={(e) => handleGenericUrlChange(item.id, e.target.value)}
                    className="w-full rounded border border-ink/25 bg-cream px-2 py-1 text-xs focus:border-oxblood"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => deleteGenericPicture(item.id)}
                  className="p-1 rounded-full text-oxblood/60 hover:text-oxblood hover:bg-oxblood/10 transition-colors cursor-pointer shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- 3. Product Categories Section --- */}
      <div className="space-y-4 rounded-xl border border-ink/10 p-5 bg-parchment/30">
        <div className="flex justify-between items-center border-b border-ink/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>
              Product Categories (e.g. Color Options)
            </h3>
            <p className="text-[10px] text-ink-soft mt-0.5">Add categories with their own unique pictures.</p>
          </div>
          <button
            type="button"
            onClick={addCategory}
            className="px-3 py-1 rounded-full bg-moss text-cream hover:bg-moss-dark transition-all text-xs uppercase tracking-wider cursor-pointer font-bold"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            + Add Category
          </button>
        </div>

        {/* Hidden input tracking category IDs */}
        <input type="hidden" name="category_keys" value={categories.map((c) => c.id).join(",")} />

        {categories.length === 0 ? (
          <p className="text-xs text-ink-soft/70 py-4 text-center italic">No categories added yet. Add at least one (e.g., "Default" or specific colors).</p>
        ) : (
          <div className="space-y-5">
            {categories.map((cat, catIdx) => (
              <div key={cat.id} className="bg-cream border border-ink/10 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-ink/10 pb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-bold text-ink/40 uppercase" style={{ fontFamily: "var(--font-stamp)" }}>
                      #{catIdx + 1}
                    </span>
                    <input
                      type="text"
                      name={`category_name_${cat.id}`}
                      value={cat.name}
                      required
                      placeholder="Category Name (e.g., Peach, Mint)"
                      onChange={(e) => handleCategoryNameChange(cat.id, e.target.value)}
                      className="max-w-[220px] rounded border border-ink/20 bg-cream px-2.5 py-1 text-xs focus:border-oxblood font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addCategoryPicture(cat.id)}
                      className="px-2.5 py-1 rounded bg-[#ede4d3] text-ink hover:bg-[#e0d4be] text-[10px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-stamp)" }}
                    >
                      + Add Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 rounded text-oxblood hover:bg-oxblood/10 transition-colors"
                      aria-label="Delete category"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sub hidden field for category picture keys */}
                <input type="hidden" name={`category_${cat.id}_picture_keys`} value={cat.images.map((img) => img.id).join(",")} />

                {cat.images.length === 0 ? (
                  <p className="text-[11px] text-ink-soft italic text-center py-2">No unique pictures for this category.</p>
                ) : (
                  <div className="space-y-2">
                    {cat.images.map((img) => (
                      <div key={img.id} className="flex gap-3 items-center bg-parchment/30 p-2.5 rounded border border-ink/5">
                        <div className="w-10 h-10 rounded bg-parchment border border-ink/15 overflow-hidden shrink-0 flex items-center justify-center">
                          {img.previewUrl ? (
                            <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[7px] text-ink-soft">No Image</span>
                          )}
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="file"
                            name={`category_${cat.id}_file_${img.id}`}
                            accept="image/jpeg, image/png, image/webp"
                            onChange={(e) => handleCategoryFileChange(cat.id, img.id, e.target.files?.[0] || null)}
                            className="w-full text-[9px] text-ink file:mr-2 file:py-0.5 file:px-1 file:rounded file:border-0 file:bg-oxblood/10 file:text-oxblood"
                          />
                          <input
                            type="text"
                            name={`category_${cat.id}_url_${img.id}`}
                            value={img.url || ""}
                            placeholder="Fallback URL path"
                            onChange={(e) => handleCategoryUrlChange(cat.id, img.id, e.target.value)}
                            className="w-full rounded border border-ink/20 bg-cream px-2 py-0.5 text-[11px] focus:border-oxblood"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteCategoryPicture(cat.id, img.id)}
                          className="p-1 rounded text-oxblood/60 hover:text-oxblood hover:bg-oxblood/10 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
        className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5 font-bold"
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
