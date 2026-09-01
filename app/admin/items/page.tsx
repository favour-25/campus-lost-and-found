import { SiteNav } from '@/components/site-nav'
import { AdminItemsTable } from '@/components/admin-items-table'
import { requireAdmin } from '@/lib/auth'
import { getAllItemsAdmin } from '@/lib/queries'

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; category?: string; status?: string }>
}) {
  const profile = await requireAdmin()
  const params = await searchParams
  const items = await getAllItemsAdmin(params)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">All reports</h1>
          <p className="mt-1 text-muted-foreground">
            Search, filter, and moderate every report on the platform.
          </p>
        </div>
        <AdminItemsTable
          items={items}
          defaultQuery={params.q ?? ''}
          defaultType={params.type ?? 'all'}
          defaultCategory={params.category ?? 'all'}
          defaultStatus={params.status ?? 'all'}
        />
      </main>
    </div>
  )
}
