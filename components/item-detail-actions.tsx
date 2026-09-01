'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markRecovered, deleteItem } from '@/lib/actions'
import type { Item } from '@/lib/types'

export function ItemDetailActions({ item }: { item: Item }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState<'recover' | 'delete' | null>(null)

  function handleMarkRecovered() {
    setBusy('recover')
    startTransition(async () => {
      const result = await markRecovered(item.id)
      setBusy(null)
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
    setBusy('delete')
    startTransition(async () => {
      const result = await deleteItem(item.id)
      setBusy(null)
      if (!result.ok) {
        toast.error(result.error ?? 'Something went wrong.')
        return
      }
      toast.success('Report deleted.')
      router.push('/my-reports')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border p-4">
      <p className="w-full text-sm text-muted-foreground">This is your report.</p>
      {item.status === 'active' && (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/my-reports/${item.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkRecovered}
            disabled={isPending && busy === 'recover'}
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as recovered
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleDelete}
        disabled={isPending && busy === 'delete'}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  )
}
