"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
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
        <Field
          label="Primary Image URL / Seed"
          name="cover_seed"
          defaultValue={initial?.cover_seed}
          placeholder="e.g. /images/peach_case.png"
        />
        <Field
          label="Secondary Image URL / Seed"
          name="cover_seed_2"
          defaultValue={initial?.cover_seed_2 || ""}
          placeholder="e.g. /images/peach_case_2.png"
        />
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
