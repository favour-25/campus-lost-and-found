import { notFound, redirect } from 'next/navigation'
import { SiteNav } from '@/components/site-nav'
import { ItemForm } from '@/components/item-form'
import { requireUser } from '@/lib/auth'
import { getOwnedItem } from '@/lib/queries'

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireUser()
  const item = await getOwnedItem(id)

  if (!item) notFound()
  if (item.user_id !== profile.id) redirect('/my-reports')
  if (item.status !== 'active') redirect('/my-reports')

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit report
          </h1>
          <p className="mt-1 text-muted-foreground">Update the details of your report.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ItemForm mode="edit" type={item.type} item={item} />
        </div>
      </main>
    </div>
  )
}
