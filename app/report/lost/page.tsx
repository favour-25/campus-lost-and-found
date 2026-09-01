import { SiteNav } from '@/components/site-nav'
import { ItemForm } from '@/components/item-form'
import { requireUser } from '@/lib/auth'

export default async function ReportLostPage() {
  const profile = await requireUser()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Report a lost item
          </h1>
          <p className="mt-1 text-muted-foreground">
            Share as much detail as you can — it helps others recognize it.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ItemForm mode="create" type="lost" />
        </div>
      </main>
    </div>
  )
}
