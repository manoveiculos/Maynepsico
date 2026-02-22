import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined';

if (!isConfigured) {
    const msg = 'ERRO DE CONFIGURAÇÃO: As chaves do Supabase não foram encontradas no arquivo .env ou estão vazias.'
    console.error(msg)
}

// Inicializa com valores vazios se não estiver configurado para evitar erro fatal de módulo
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
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
