import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// WARNING: This client has admin privileges. Only use on the server!
// Lazy initialization to avoid build-time errors when env vars are not set
let _supabaseAdmin: SupabaseClient | null = null

export const getSupabaseAdmin = (): SupabaseClient => {
    if (!_supabaseAdmin) {
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase service role environment variables')
        }
        _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })
    }
    return _supabaseAdmin
}

// For backwards compatibility - will throw at runtime if env vars missing
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return getSupabaseAdmin()[prop as keyof SupabaseClient]
    }
})
