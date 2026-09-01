import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client. NEVER import this into client components.
 * Only use it in server code AFTER verifying the caller is an admin
 * via requireAdmin(). It bypasses RLS.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
