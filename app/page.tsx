import Link from 'next/link'
import {
  Search,
  BellRing,
  HandHeart,
  ArrowRight,
  PackageSearch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteNav } from '@/components/site-nav'
import { ItemCard } from '@/components/item-card'
import { getSessionProfile } from '@/lib/auth'
import { getBrowseItems } from '@/lib/queries'

export default async function HomePage() {
  const profile = await getSessionProfile()
  const recent = (await getBrowseItems({})).slice(0, 4)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Reuniting students with their belongings
              </span>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Lost something on campus? Let&apos;s find it together.
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground text-pretty leading-relaxed">
                Report lost and found items, browse what others have found, and
                connect directly to get your belongings back — all in one place.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={profile ? '/report' : '/auth/sign-up'}>
                    Report an item
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/items">Browse items</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4 pt-8">
                  <StatCard value="Fast" label="Direct contact with finders" tone="primary" />
                  <StatCard value="Secure" label="Verified campus accounts" tone="muted" />
                </div>
                <div className="flex flex-col gap-4">
                  <StatCard value="Simple" label="Report in under a minute" tone="accent" />
                  <StatCard value="Open" label="Browse without an account" tone="muted" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-balance">
                How it works
              </h2>
              <p className="mt-2 text-muted-foreground text-pretty">
                Three simple steps whether you&apos;ve lost something or found an
                item that belongs to someone else.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <StepCard
                icon={BellRing}
                step="01"
                title="Report it"
                description="Post a lost or found item with a photo, category, location, and the date it happened."
              />
              <StepCard
                icon={Search}
                step="02"
                title="Browse & match"
                description="Search through active reports and filter by category or type to find a match quickly."
              />
              <StepCard
                icon={HandHeart}
                step="03"
                title="Reconnect"
                description="Reach out using the poster's contact details, then mark the item as recovered."
              />
            </div>
          </div>
        </section>

        {/* Recent items */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Recently reported
              </h2>
              <p className="mt-2 text-muted-foreground">
                The latest lost and found items from around campus.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/items">
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
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <PackageSearch className="h-6 w-6" />
              </span>
              <p className="text-muted-foreground">
                No items reported yet. Be the first to post one.
              </p>
              <Button asChild>
                <Link href={profile ? '/report' : '/auth/sign-up'}>Report an item</Link>
              </Button>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Search className="h-3.5 w-3.5" />
            </span>
            <span className="font-display font-semibold">Campus Lost &amp; Found</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Helping students recover what matters.
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({
  value,
  label,
  tone,
}: {
  value: string
  label: string
  tone: 'primary' | 'accent' | 'muted'
}) {
  const toneClasses =
    tone === 'primary'
      ? 'bg-primary text-primary-foreground'
      : tone === 'accent'
        ? 'bg-accent text-accent-foreground'
        : 'bg-card text-card-foreground border border-border'
  return (
    <div className={`rounded-2xl p-5 ${toneClasses}`}>
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm opacity-90 text-pretty">{label}</p>
    </div>
  )
}

function StepCard({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof BellRing
  step: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-display text-sm font-semibold text-muted-foreground">
          {step}
        </span>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
        {description}
      </p>
    </div>
  )
}
