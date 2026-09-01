import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, CalendarDays, Mail, Phone, ImageIcon } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { TypeBadge, StatusBadge } from '@/components/item-badges'
import { ItemDetailActions } from '@/components/item-detail-actions'
import { Button } from '@/components/ui/button'
import { getSessionProfile } from '@/lib/auth'
import { getItemWithPoster } from '@/lib/queries'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getSessionProfile()
  const item = await getItemWithPoster(id)

  if (!item) notFound()

  const isOwner = profile?.id === item.user_id

  return (
    <div className="flex min-h-svh flex-col">
      <SiteNav profile={profile} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 w-fit">
          <Link href="/items">
            <ArrowLeft className="h-4 w-4" />
            Back to browse
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-secondary">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {item.category}
              </span>
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
              {item.title}
            </h1>

            <p className="whitespace-pre-wrap text-muted-foreground text-pretty leading-relaxed">
              {item.description}
            </p>

            <div className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">
                    {item.type === 'lost' ? 'Last seen' : 'Found at'}
                  </p>
                  <p className="font-medium">{item.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">
                    {item.type === 'lost' ? 'Date lost' : 'Date found'}
                  </p>
                  <p className="font-medium">{formatDate(item.date_occurred)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 font-display text-lg font-semibold">Contact</h2>
              {item.poster ? (
                <div className="flex flex-col gap-2 text-sm">
                  <p className="font-medium">{item.poster.full_name}</p>
                  <a
                    href={`mailto:${item.poster.email}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {item.poster.email}
                  </a>
                  {item.poster.phone && (
                    <a
                      href={`tel:${item.poster.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {item.poster.phone}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Link href="/auth/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>{' '}
                  to view contact details for this report.
                </p>
              )}
            </div>

            {isOwner && <ItemDetailActions item={item} />}
          </div>
        </div>
      </main>
    </div>
  )
}
