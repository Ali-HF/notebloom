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
  // State for image previews and errors
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [secondaryPreview, setSecondaryPreview] = useState<string | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const [secondaryError, setSecondaryError] = useState<string | null>(null);

  // Helper to validate and preview uploaded files
  const handleFileUpload = (fieldName: string, setPreview: (url: string | null) => void, setError: (msg: string | null) => void) => {
    const input = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
    if (!input?.files?.[0]) {
      setError("Please select a file.");
      return;
    }
    const file = input.files[0];
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("File must be JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File must be smaller than 2 MB.");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    // Clear any existing URL text fields so the uploaded file takes precedence
    if (fieldName === "cover_file") {
      const primary = document.querySelector('input[name="cover_seed"]') as HTMLInputElement;
      if (primary) primary.value = "";
    } else if (fieldName === "cover_file_2") {
      const secondary = document.querySelector('input[name="cover_seed_2"]') as HTMLInputElement;
      if (secondary) secondary.value = "";
    }
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Field
            label="Primary Image URL"
            name="cover_seed"
            defaultValue={initial?.cover_seed}
            placeholder="e.g. /images/peach_case.png"
          />
        </div>
        <div>
          <Field
            label="Secondary Image URL"
            name="cover_seed_2"
            defaultValue={initial?.cover_seed_2 || ""}
            placeholder="e.g. /images/peach_case_2.png"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 rounded-md border border-ink/10 p-4">
          <label className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5" style={{ fontFamily: "var(--font-stamp)" }} htmlFor="cover_file">
            Upload Primary Image (max 2MB)
          </label>
          <input
            type="file"
            id="cover_file"
            name="cover_file"
            accept="image/jpeg, image/png, image/webp"
            className="w-full text-sm text-ink"
            ref={primaryInputRef}
            onChange={() => handleFileUpload('cover_file', setPrimaryPreview, setPrimaryError)}
          />
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-md bg-oxblood text-cream hover:bg-oxblood-dark transition-colors text-xs uppercase tracking-wider cursor-pointer"
            style={{ fontFamily: "var(--font-stamp)" }}
            onClick={() => {
              console.log('Primary upload button clicked');
              primaryInputRef.current?.click();
            }}
          >
            Upload Primary Image
          </button>
          {primaryError && <p className="text-sm text-oxblood mt-1">{primaryError}</p>}
          {primaryPreview && (
            <img src={primaryPreview} alt="Primary preview" className="mt-2 max-h-48 rounded object-contain border border-ink/10" />
          )}
        </div>
        <div className="space-y-2 rounded-md border border-ink/10 p-4">
          <label className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5" style={{ fontFamily: "var(--font-stamp)" }} htmlFor="cover_file_2">
            Upload Secondary Image (max 2MB)
          </label>
          <input
            type="file"
            id="cover_file_2"
            name="cover_file_2"
            accept="image/jpeg, image/png, image/webp"
            className="w-full text-sm text-ink"
            ref={secondaryInputRef}
            onChange={() => handleFileUpload('cover_file_2', setSecondaryPreview, setSecondaryError)}
          />
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-md bg-oxblood text-cream hover:bg-oxblood-dark transition-colors text-xs uppercase tracking-wider cursor-pointer"
            style={{ fontFamily: "var(--font-stamp)" }}
            onClick={() => {
              console.log('Secondary upload button clicked');
              secondaryInputRef.current?.click();
            }}
          >
            Upload Secondary Image
          </button>
          {secondaryError && <p className="text-sm text-oxblood mt-1">{secondaryError}</p>}
          {secondaryPreview && (
            <img src={secondaryPreview} alt="Secondary preview" className="mt-2 max-h-48 rounded object-contain border border-ink/10" />
          )}
        </div>
      </div>

      {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer"
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
