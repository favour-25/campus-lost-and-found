'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireUser, requireAdmin, getSessionProfile } from '@/lib/auth'
import {
  CATEGORIES,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  IMAGE_BUCKET,
} from '@/lib/constants'
import type { ItemType } from '@/lib/types'

export interface ActionResult {
  ok: boolean
  error?: string
  itemId?: string
}

function validateItemInput(fd: FormData) {
  const title = String(fd.get('title') ?? '').trim()
  const category = String(fd.get('category') ?? '').trim()
  const description = String(fd.get('description') ?? '').trim()
  const location = String(fd.get('location') ?? '').trim()
  const date_occurred = String(fd.get('date_occurred') ?? '').trim()

  if (!title) return { error: 'Please enter an item title.' }
  if (title.length > 120) return { error: 'Title is too long (max 120 characters).' }
  if (!category || !CATEGORIES.includes(category as (typeof CATEGORIES)[number]))
    return { error: 'Please choose a valid category.' }
  if (!description) return { error: 'Please enter a description.' }
  if (description.length > 2000)
    return { error: 'Description is too long (max 2000 characters).' }
  if (!location) return { error: 'Please enter a location.' }
  if (!date_occurred) return { error: 'Please choose a date.' }

  return { values: { title, category, description, location, date_occurred } }
}

/** Upload an item image to Supabase Storage, returns public URL or null. */
async function uploadImage(
  file: File | null,
  userId: string,
): Promise<{ url: string | null; error?: string }> {
  if (!file || file.size === 0) return { url: null }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, error: 'Image must be a JPG, PNG, or WEBP file.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { url: null, error: 'Image must be smaller than 5MB.' }
  }

  const supabase = await createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return { url: null, error: 'Image upload failed. Please try again.' }

  const {
    data: { publicUrl },
  } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)

  return { url: publicUrl }
}

export async function createItem(
  type: ItemType,
  fd: FormData,
): Promise<ActionResult> {
  const profile = await requireUser()

  const parsed = validateItemInput(fd)
  if (parsed.error) return { ok: false, error: parsed.error }

  const image = await uploadImage(fd.get('image') as File | null, profile.id)
  if (image.error) return { ok: false, error: image.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .insert({
      user_id: profile.id,
      type,
      status: 'active',
      image_url: image.url,
      ...parsed.values,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: 'Could not save your report. Please try again.' }

  revalidatePath('/items')
  revalidatePath('/my-reports')
  revalidatePath('/dashboard')
  return { ok: true, itemId: data.id }
}

export async function updateItem(
  id: string,
  fd: FormData,
): Promise<ActionResult> {
  const profile = await requireUser()

  const parsed = validateItemInput(fd)
  if (parsed.error) return { ok: false, error: parsed.error }

  const supabase = await createClient()

  // Ownership is enforced by RLS, but we also confirm existence + active status.
  const { data: existing } = await supabase
    .from('items')
    .select('id, user_id, status, image_url')
    .eq('id', id)
    .maybeSingle()

  if (!existing || existing.user_id !== profile.id)
    return { ok: false, error: 'You can only edit your own reports.' }
  if (existing.status !== 'active')
    return { ok: false, error: 'Recovered reports can no longer be edited.' }

  let imageUrl = existing.image_url as string | null
  const file = fd.get('image') as File | null
  if (file && file.size > 0) {
    const image = await uploadImage(file, profile.id)
    if (image.error) return { ok: false, error: image.error }
    imageUrl = image.url
  }

  const { error } = await supabase
    .from('items')
    .update({ ...parsed.values, image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { ok: false, error: 'Could not update the report. Please try again.' }

  revalidatePath('/items')
  revalidatePath('/my-reports')
  revalidatePath(`/items/${id}`)
  return { ok: true, itemId: id }
}

export async function markRecovered(id: string): Promise<ActionResult> {
  const profile = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ status: 'recovered', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', profile.id)

  if (error) return { ok: false, error: 'Could not update status. Please try again.' }

  revalidatePath('/items')
  revalidatePath('/my-reports')
  revalidatePath('/dashboard')
  revalidatePath(`/items/${id}`)
  return { ok: true }
}

export async function deleteItem(id: string): Promise<ActionResult> {
  const profile = await requireUser()
  const supabase = await createClient()

  // RLS restricts this to the owner (or admin via role in policy).
  const { error } = await supabase.from('items').delete().eq('id', id)

  if (error) return { ok: false, error: 'Could not delete the report. Please try again.' }

  revalidatePath('/items')
  revalidatePath('/my-reports')
  revalidatePath('/dashboard')
  void profile
  return { ok: true }
}

/** Admin delete — verifies admin role, then uses service role to bypass RLS. */
export async function adminDeleteItem(id: string): Promise<ActionResult> {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) return { ok: false, error: 'Could not delete the report. Please try again.' }

  revalidatePath('/admin')
  revalidatePath('/admin/items')
  revalidatePath('/items')
  return { ok: true }
}

export async function updateProfile(fd: FormData): Promise<ActionResult> {
  const profile = await requireUser()
  const supabase = await createClient()

  const full_name = String(fd.get('full_name') ?? '').trim()
  const phone = String(fd.get('phone') ?? '').trim()
  const department = String(fd.get('department') ?? '').trim()
  const level = String(fd.get('level') ?? '').trim()

  if (!full_name) return { ok: false, error: 'Please enter your full name.' }
  if (phone && !/^[+()\d\s-]{6,20}$/.test(phone))
    return { ok: false, error: 'Please enter a valid phone number.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone: phone || null,
      department: department || null,
      level: level || null,
    })
    .eq('id', profile.id)

  if (error) return { ok: false, error: 'Could not save your profile. Please try again.' }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/** Used by client nav to know current identity without prop drilling. */
export async function getMe() {
  return getSessionProfile()
}
