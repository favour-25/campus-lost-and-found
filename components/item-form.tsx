'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/constants'
import { createItem, updateItem } from '@/lib/actions'
import type { Item, ItemType } from '@/lib/types'

interface ItemFormProps {
  mode: 'create' | 'edit'
  type: ItemType
  item?: Item
}

export function ItemForm({ mode, type, item }: ItemFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(item?.title ?? '')
  const [category, setCategory] = useState(item?.category ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [dateOccurred, setDateOccurred] = useState(item?.date_occurred ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(item?.image_url ?? null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const noun = type === 'lost' ? 'lost' : 'found'
  const today = new Date().toISOString().split('T')[0]

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!category) {
      setError('Please choose a category.')
      return
    }

    setIsSubmitting(true)

    const fd = new FormData()
    fd.set('title', title)
    fd.set('category', category)
    fd.set('description', description)
    fd.set('location', location)
    fd.set('date_occurred', dateOccurred)
    if (imageFile) fd.set('image', imageFile)

    const result =
      mode === 'create' ? await createItem(type, fd) : await updateItem(item!.id, fd)

    setIsSubmitting(false)

    if (!result.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }

    toast.success(
      mode === 'create'
        ? `Your ${noun} item report has been posted.`
        : 'Your report has been updated.',
    )

    if (mode === 'create') {
      router.push(`/items/${result.itemId}`)
    } else {
      router.push('/my-reports')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="title">Item title</Label>
        <Input
          id="title"
          required
          maxLength={120}
          placeholder={
            type === 'lost'
              ? 'e.g. Black North Face backpack'
              : 'e.g. Silver keys with red keychain'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          required
          maxLength={2000}
          rows={5}
          placeholder="Include distinguishing details — color, brand, contents, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="location">
            {type === 'lost' ? 'Last seen location' : 'Location found'}
          </Label>
          <Input
            id="location"
            required
            placeholder="e.g. Faculty of Science, Block C"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date_occurred">{type === 'lost' ? 'Date lost' : 'Date found'}</Label>
          <Input
            id="date_occurred"
            type="date"
            required
            max={today}
            value={dateOccurred}
            onChange={(e) => setDateOccurred(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Photo (optional)</Label>
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="mt-2 h-32 w-32 rounded-lg border border-border object-cover"
          />
        )}
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP. Max 5MB.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? `Post ${noun} item report` : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
