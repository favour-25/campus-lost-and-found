import { PackageSearch } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { ItemsFilterBar } from '@/components/items-filter-bar'
import { ItemCard } from '@/components/item-card'
import { EmptyState } from '@/components/empty-state'
import { getSessionProfile } from '@/lib/auth'
import { getBrowseItems } from '@/lib/queries'

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; category?: string }>
}) {
  const params = await searchParams
  const profile = await getSessionProfile()
  const items = await getBrowseItems({
    q: params.q,
    type: params.type,
    category: params.category,
  })

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Browse lost &amp; found
          </h1>
          <p className="mt-1 text-muted-foreground">
            Search active reports from across campus.
          </p>
        </div>

        <ItemsFilterBar
          defaultQuery={params.q ?? ''}
          defaultType={params.type ?? 'all'}
          defaultCategory={params.category ?? 'all'}
        />

        {items.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={PackageSearch}
              title="No matching items"
              description="Try adjusting your search or filters, or check back later."
            />
          </div>
        )}
      </main>
    </div>
  )
}
