import { cn } from '@/lib/utils'
import type { ItemStatus, ItemType } from '@/lib/types'

export function TypeBadge({ type }: { type: ItemType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        type === 'lost'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-accent/25 text-accent-foreground',
      )}
    >
      {type}
    </span>
  )
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'recovered'
          ? 'bg-success/10 text-success'
          : 'bg-secondary text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'recovered' ? 'bg-success' : 'bg-muted-foreground',
        )}
      />
      {status === 'recovered' ? 'Recovered' : 'Active'}
    </span>
  )
}
