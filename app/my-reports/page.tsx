import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { EmptyState } from '@/components/empty-state'
import { MyReportCard } from '@/components/my-report-card'
import { Button } from '@/components/ui/button'
import { requireUser } from '@/lib/auth'
import { getUserItems } from '@/lib/queries'

export default async function MyReportsPage() {
  const profile = await requireUser()
  const items = await getUserItems(profile.id)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">My reports</h1>
            <p className="mt-1 text-muted-foreground">
              Manage the lost and found items you&apos;ve reported.
            </p>
          </div>
          <Button asChild size="lg" className="w-fit">
            <Link href="/report">
              <Plus className="h-4 w-4" />
              Report an item
            </Link>
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MyReportCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No reports yet"
            description="Reports you create will show up here so you can track and manage them."
            action={
              <Button asChild>
                <Link href="/report">
                  <Plus className="h-4 w-4" />
                  Report an item
                </Link>
              </Button>
            }
          />
        )}
      </main>
    </div>
  )
}
