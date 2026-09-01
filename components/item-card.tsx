import Link from 'next/link'
import { MapPin, CalendarDays, ImageIcon } from 'lucide-react'
import { TypeBadge, StatusBadge } from '@/components/item-badges'
import type { Item } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url || '/placeholder.svg'}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </div>
        {item.status === 'recovered' && (
          <div className="absolute right-3 top-3">
            <StatusBadge status={item.status} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-snug text-pretty line-clamp-1">
            {item.title}
          </h3>
        </div>
        <span className="inline-flex w-fit items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {item.category}
        </span>
        <p className="line-clamp-2 text-sm text-muted-foreground text-pretty">
          {item.description}
        </p>
        <div className="mt-auto flex flex-col gap-1 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {formatDate(item.date_occurred)}
          </span>
        </div>
      </div>
    </Link>
  )
}
