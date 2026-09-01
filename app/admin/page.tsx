import Link from 'next/link'
import {
  Users,
  PackageX,
  PackageCheck,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { ItemCard } from '@/components/item-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth'
import { getAdminStats, getRecentItemsAdmin } from '@/lib/queries'

export default async function AdminDashboardPage() {
  const profile = await requireAdmin()
  const [stats, recent] = await Promise.all([getAdminStats(), getRecentItemsAdmin(8)])

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Admin overview</h1>
          <p className="mt-1 text-muted-foreground">
            A snapshot of activity across the platform.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile icon={Users} label="Students" value={stats.students} />
          <StatTile icon={PackageX} label="Lost reports" value={stats.lost} />
          <StatTile icon={PackageCheck} label="Found reports" value={stats.found} />
          <StatTile icon={ClipboardList} label="Active" value={stats.active} />
          <StatTile icon={CheckCircle2} label="Recovered" value={stats.recovered} />
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent reports</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/items">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recent.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No reports yet"
              description="Reports will appear here once students start posting."
            />
          )}
        </div>
      </main>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
