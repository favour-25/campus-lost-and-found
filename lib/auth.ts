import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

/**
 * Returns the current auth user + profile, or null if not signed in.
 */
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, department, level, role, created_at')
    .eq('id', user.id)
    .single()

  return (profile as Profile) ?? null
}

/**
 * Requires an authenticated user. Redirects to login otherwise.
 */
export async function requireUser(): Promise<Profile> {
  const profile = await getSessionProfile()
  if (!profile) redirect('/auth/login')
  return profile
}

/**
 * Requires an admin user. Students are redirected to their dashboard;
 * anonymous users to login. Enforced server-side, never trusting the client.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getSessionProfile()
  if (!profile) redirect('/auth/login')
  if (profile.role !== 'admin') redirect('/dashboard')
  return profile
}
