import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listBooks, formatPrice, getAdminStats } from "@/lib/db";
import { deleteBookAction } from "@/app/actions/admin-actions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) redirect("/login?next=/admin");

  const books = await listBooks();
  const stats = await getAdminStats();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="text-xs tracking-[0.22em] uppercase text-oxblood mb-2"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Admin
          </p>
          <h1
            className="text-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Inventory
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-full ring-1 ring-ink/20 text-sm hover:ring-oxblood transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            VIEW ORDERS
          </Link>
          <Link
            href="/admin/new"
            className="px-4 py-2 rounded-full bg-oxblood text-cream text-sm hover:bg-oxblood-dark transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            + NEW PRODUCT
          </Link>
        </div>
      </div>

      {/* Analytics Summary Cards (Requirement 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenueCents)} />
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} />
        <StatCard title="Total Products" value={stats.totalProducts.toString()} />
        <StatCard title="Low Stock Alerts" value={stats.lowStockCount.toString()} isAlert={stats.lowStockCount > 0} />
      </div>

      {/* Inventory List Card Wrapper */}
      <div className="bg-cream border border-ink/10 rounded-xl p-6 shadow-[0_4px_12px_rgba(34,29,24,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs tracking-[0.12em] uppercase text-ink-soft border-b border-ink/15"
                style={{ fontFamily: "var(--font-stamp)" }}
              >
                <th className="pb-3 pr-4 font-semibold">Title</th>
                <th className="pb-3 pr-4 font-semibold">Category</th>
                <th className="pb-3 pr-4 font-semibold">Price</th>
                <th className="pb-3 pr-4 font-semibold">Stock</th>
                <th className="pb-3 pr-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-b border-ink/10 last:border-0 hover:bg-parchment/20 transition-colors">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-ink" style={{ fontFamily: "var(--font-body)" }}>
                      {b.title}
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5">{b.author}</p>
                  </td>
                  <td className="py-4 pr-4 text-ink-soft">{b.genre}</td>
                  <td className="py-4 pr-4 font-medium" style={{ fontFamily: "var(--font-stamp)" }}>
                    {formatPrice(b.price_cents)}
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap">
                    <span className={b.stock === 0 ? "text-oxblood font-semibold" : "font-medium"}>{b.stock}</span>
                    {/* Stock Level Warning Badges (Requirement 5) */}
                    {b.stock === 0 && (
                      <span className="ml-2 text-[9px] uppercase font-bold text-oxblood bg-oxblood/10 border border-oxblood/20 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-stamp)" }}>
                        OUT OF STOCK
                      </span>
                    )}
                    {b.stock > 0 && b.stock < 5 && (
                      <span className="ml-2 text-[9px] uppercase font-bold text-brass bg-brass/10 border border-brass/20 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-stamp)" }}>
                        LOW STOCK
                      </span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right whitespace-nowrap">
                    <Link href={`/admin/edit/${b.id}`} className="trail-link text-ink mr-4 font-medium" style={{ fontFamily: "var(--font-stamp)" }}>
                      EDIT
                    </Link>
                    <form action={deleteBookAction.bind(null, b.id)} className="inline">
                      <button type="submit" className="trail-link text-oxblood cursor-pointer font-medium" style={{ fontFamily: "var(--font-stamp)" }}>
                        DELETE
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, isAlert = false }: { title: string; value: string; isAlert?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border-t-4 ring-1 ring-ink/5 bg-cream shadow-sm ${
      isAlert 
        ? 'border-t-oxblood border-x border-b border-oxblood/20 bg-oxblood/[0.02]' 
        : 'border-t-brass border-x border-b border-ink/10'
    }`}>
      <p className="text-xs uppercase text-ink-soft tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>{title}</p>
      <p className={`text-2xl mt-2 font-bold tracking-tight ${isAlert ? 'text-oxblood' : 'text-ink'}`} style={{ fontFamily: "var(--font-display)" }}>{value}</p>
    </div>
  );
}
