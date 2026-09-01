'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import {
  ImageIcon,
  MapPin,
  CalendarDays,
  Pencil,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { TypeBadge, StatusBadge } from '@/components/item-badges'
import { Button } from '@/components/ui/button'
import { markRecovered, deleteItem } from '@/lib/actions'
import type { Item } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function MyReportCard({ item }: { item: Item }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleMarkRecovered() {
    startTransition(async () => {
      const result = await markRecovered(item.id)
      if (!result.ok) {
        toast.error(result.error ?? 'Something went wrong.')
        return
      }
      toast.success('Marked as recovered.')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteItem(item.id)
      if (!result.ok) {
        toast.error(result.error ?? 'Something went wrong.')
        return
      }
      toast.success('Report deleted.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Link
        href={`/items/${item.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-secondary"
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </div>
        <div className="absolute right-3 top-3">
          <StatusBadge status={item.status} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/items/${item.id}`}
          className="line-clamp-1 font-medium leading-snug hover:underline"
        >
          {item.title}
        </Link>
        <span className="inline-flex w-fit items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {item.category}
        </span>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {formatDate(item.date_occurred)}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {item.status === 'active' && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/my-reports/${item.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkRecovered}
                disabled={isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Recovered
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
