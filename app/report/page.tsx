import Link from 'next/link'
import { PackageX, PackageCheck } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { requireUser } from '@/lib/auth'

export default async function ReportChooserPage() {
  const profile = await requireUser()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
            What would you like to report?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose the option that matches your situation.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/report/lost"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-destructive/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <PackageX className="h-7 w-7" />
            </span>
            <h2 className="font-display text-xl font-semibold">I lost something</h2>
            <p className="text-sm text-muted-foreground text-pretty">
              Report an item you&apos;ve lost so others can help you find it.
            </p>
          </Link>
          <Link
            href="/report/found"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-accent/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/25 text-accent-foreground">
              <PackageCheck className="h-7 w-7" />
            </span>
            <h2 className="font-display text-xl font-semibold">I found something</h2>
            <p className="text-sm text-muted-foreground text-pretty">
              Report an item you&apos;ve found so the owner can be reunited with it.
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
