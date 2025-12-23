import { createBrowserClient } from '@supabase/ssr'

// Cliente Supabase para Frontend (permite auth y realtime)
export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

