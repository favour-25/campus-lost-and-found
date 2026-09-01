'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { Search, Trash2, ImageIcon, ClipboardList } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypeBadge, StatusBadge } from '@/components/item-badges'
import { EmptyState } from '@/components/empty-state'
import { CATEGORIES } from '@/lib/constants'
import { adminDeleteItem } from '@/lib/actions'
import type { Item, Profile } from '@/lib/types'

type AdminItem = Item & { poster: Pick<Profile, 'full_name' | 'email'> | null }

interface FilterState {
  q?: string
  type?: string
  category?: string
  status?: string
}

export function AdminItemsTable({
  items,
  defaultQuery,
  defaultType,
  defaultCategory,
  defaultStatus,
}: {
  items: AdminItem[]
  defaultQuery: string
  defaultType: string
  defaultCategory: string
  defaultStatus: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [q, setQ] = useState(defaultQuery)

  function navigate(next: FilterState) {
    const merged = {
      q,
      type: defaultType,
      category: defaultCategory,
      status: defaultStatus,
      ...next,
    }
    const sp = new URLSearchParams()
    if (merged.q) sp.set('q', merged.q)
    if (merged.type && merged.type !== 'all') sp.set('type', merged.type)
    if (merged.category && merged.category !== 'all') sp.set('category', merged.category)
    if (merged.status && merged.status !== 'all') sp.set('status', merged.status)
    router.push(sp.toString() ? `${pathname}?${sp.toString()}` : pathname)
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    startTransition(async () => {
      const result = await adminDeleteItem(id)
      if (!result.ok) {
        toast.error(result.error ?? 'Something went wrong.')
        return
      }
      toast.success('Report deleted.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            navigate({ q })
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reports…"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select defaultValue={defaultType} onValueChange={(v) => navigate({ type: v ?? 'all' })}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="found">Found</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue={defaultCategory} onValueChange={(v) => navigate({ category: v ?? 'all' })}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue={defaultStatus} onValueChange={(v) => navigate({ status: v ?? 'all' })}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="recovered">Recovered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No reports found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Posted by</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="line-clamp-1 font-medium">{item.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={item.type} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.poster?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.date_occurred).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
