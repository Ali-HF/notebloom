import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBook } from "@/lib/db";
import BookForm from "@/components/BookForm";
import { updateBookAction } from "@/app/actions/admin-actions";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) notFound();

  const { id } = await params;
  const book = await getBook(Number(id));
  if (!book) notFound();

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
        Edit “{book.title}”
      </h1>
      <BookForm
        action={updateBookAction.bind(null, book.id)}
        initial={book}
        submitLabel="SAVE CHANGES"
      />
    </div>
  );
}
