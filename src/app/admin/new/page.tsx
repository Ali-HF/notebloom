import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import BookForm from "@/components/BookForm";
import { createBookAction } from "@/app/actions/admin-actions";

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p
        className="text-xs tracking-[0.22em] uppercase text-oxblood mb-2"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        Admin
      </p>
      <h1
        className="text-4xl mb-8"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
        Add a product
      </h1>
      <BookForm action={createBookAction} submitLabel="ADD PRODUCT" />
    </div>
  );
}
