import { createClient } from '@supabase/supabase-js'

// Fallback hardcoded para quando .env não está disponível (ex: build na Hostinger)
// A anon key é PÚBLICA por design — a segurança vem das RLS policies no Supabase
const FALLBACK_URL = 'https://lfwvhfncegshxuljwppc.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd3ZoZm5jZWdzaHh1bGp3cHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTE2NDUsImV4cCI6MjA3MTAyNzY0NX0.qU4x25I0ZlXD_Bk74vrrKJy063sfnKGevRc0xf9W2uA'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL?.trim()) || FALLBACK_URL
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) || FALLBACK_KEY

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: true,
            storageKey: 'bloom-auth-token',
            storage: window.localStorage,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            lock: false
        },
        global: {
            headers: { 'x-application-name': 'bloom-psicologia' },
        },
        db: {
            schema: 'public'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
)
