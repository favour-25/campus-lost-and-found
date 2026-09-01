import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Plus,
  PackageSearch,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteNav } from '@/components/site-nav'
import { ItemCard } from '@/components/item-card'
import { EmptyState } from '@/components/empty-state'
import { getSessionProfile } from '@/lib/auth'
import { getUserItems, getStudentStats } from '@/lib/queries'

export default async function DashboardPage() {
  const profile = await getSessionProfile()
  if (!profile) redirect('/auth/login')
  if (profile.role === 'admin') redirect('/admin')

  const [items, stats] = await Promise.all([
    getUserItems(profile.id),
    getStudentStats(profile.id),
  ])
  const recent = items.slice(0, 4)
  const firstName = profile.full_name?.split(' ')[0] || 'there'

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track your reports and browse recent campus activity.
            </p>
          </div>
          <Button asChild size="lg" className="w-fit">
            <Link href="/report">
              <Plus className="h-4 w-4" />
              Report an item
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatTile
            icon={ClipboardList}
            label="Total reports"
            value={stats.total}
            tone="primary"
          />
          <StatTile
            icon={PackageSearch}
            label="Active"
            value={stats.active}
            tone="muted"
          />
          <StatTile
            icon={CheckCircle2}
            label="Recovered"
            value={stats.recovered}
            tone="success"
          />
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Your recent reports</h2>
            {items.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/my-reports">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {recent.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No reports yet"
              description="When you report a lost or found item, it will appear here so you can track its status."
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
        </div>
      </main>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ClipboardList
  label: string
  value: number
  tone: 'primary' | 'muted' | 'success'
}) {
  const iconClasses =
    tone === 'primary'
      ? 'bg-primary/10 text-primary'
      : tone === 'success'
        ? 'bg-success/10 text-success'
        : 'bg-secondary text-muted-foreground'
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClasses}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
