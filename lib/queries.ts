import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Item, ItemWithPoster, Profile } from '@/lib/types'

const ITEM_COLUMNS =
  'id, user_id, type, title, category, description, location, date_occurred, image_url, status, created_at, updated_at'

export interface ItemFilters {
  q?: string
  type?: string
  category?: string
  status?: string
}

/** Public browse: active items only, filtered. Uses RLS-scoped client. */
export async function getBrowseItems(filters: ItemFilters): Promise<Item[]> {
  const supabase = await createClient()
  let query = supabase.from('items').select(ITEM_COLUMNS)

  // Default browse shows active items; allow explicit status filter otherwise.
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'active')
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }
  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }
  if (filters.q) {
    const term = `%${filters.q}%`
    query = query.or(
      `title.ilike.${term},description.ilike.${term},location.ilike.${term}`,
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data as Item[]) ?? []
}

/** Single item with poster contact info for the detail page. */
export async function getItemWithPoster(
  id: string,
): Promise<ItemWithPoster | null> {
  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('items')
    .select(ITEM_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!item) return null

  // Separate query rather than an embedded `poster:profiles(...)` select —
  // RLS only allows an authenticated caller to read another user's profile,
  // so an anonymous visitor simply gets `poster: null` here and the detail
  // page prompts them to sign in to see contact info.
  const { data: poster } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', (item as Item).user_id)
    .maybeSingle()

  return {
    ...(item as Item),
    poster: (poster as Pick<Profile, 'full_name' | 'email' | 'phone'>) ?? null,
  }
}

/** All reports created by a specific user. */
export async function getUserItems(userId: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Item[]) ?? []
}

/** A single item owned by the current user (for edit). */
export async function getOwnedItem(id: string): Promise<Item | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data as Item) ?? null
}

export interface StudentStats {
  total: number
  active: number
  recovered: number
}

export async function getStudentStats(userId: string): Promise<StudentStats> {
  const items = await getUserItems(userId)
  return {
    total: items.length,
    active: items.filter((i) => i.status === 'active').length,
    recovered: items.filter((i) => i.status === 'recovered').length,
  }
}

/* ------------------------- ADMIN QUERIES (service role) ------------------------ */
/* These MUST only be called from pages guarded by requireAdmin(). */

export async function getAllItemsAdmin(
  filters: ItemFilters,
): Promise<(Item & { poster: Pick<Profile, 'full_name' | 'email'> | null })[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('items')
    .select(`${ITEM_COLUMNS}, poster:profiles(full_name, email)`)

  if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type)
  if (filters.category && filters.category !== 'all')
    query = query.eq('category', filters.category)
  if (filters.status && filters.status !== 'all')
    query = query.eq('status', filters.status)
  if (filters.q) {
    const term = `%${filters.q}%`
    query = query.or(
      `title.ilike.${term},description.ilike.${term},location.ilike.${term}`,
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any) ?? []
}

export async function getAllUsersAdmin(): Promise<Profile[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, department, level, role, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Profile[]) ?? []
}

export interface AdminStats {
  students: number
  lost: number
  found: number
  active: number
  recovered: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient()
  const [{ data: profiles }, { data: items }] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('items').select('type, status'),
  ])

  const itemsList = items ?? []
  return {
    students: (profiles ?? []).filter((p) => p.role === 'student').length,
    lost: itemsList.filter((i) => i.type === 'lost').length,
    found: itemsList.filter((i) => i.type === 'found').length,
    active: itemsList.filter((i) => i.status === 'active').length,
    recovered: itemsList.filter((i) => i.status === 'recovered').length,
  }
}

export async function getRecentItemsAdmin(
  limit = 8,
): Promise<(Item & { poster: Pick<Profile, 'full_name'> | null })[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('items')
    .select(`${ITEM_COLUMNS}, poster:profiles(full_name)`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any) ?? []
}
