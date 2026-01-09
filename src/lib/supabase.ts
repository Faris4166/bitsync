import { createClient } from '@supabase/supabase-js'

// Clean keys function to handle common copy-paste issues like quotes
const cleanKey = (key: string | undefined) => {
  if (!key) return ''
  return key.trim().replace(/^['"](.*)['"]$/, '$1')
}

const supabaseUrl = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabaseServiceKey = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY)

// Helper to check if URL is valid
const isValidUrl = (url: string) => {
  try {
    return Boolean(new URL(url))
  } catch {
    return false
  }
}

// Diagnostic Logging (Server-side only)
if (typeof window === 'undefined') {
  const isUrlValid = isValidUrl(supabaseUrl)
  
  if (!supabaseUrl || !isUrlValid) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL is missing or invalid in .env.local')
    console.log('Got:', `"${supabaseUrl}"`)
  }
  
  if (!supabaseAnonKey) {
    console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local')
  }

  if (!supabaseServiceKey) {
    console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail due to RLS.')
  }
}

// Provide fallback values for createClient to prevent crash, but log error
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co'
const finalAnonKey = supabaseAnonKey || 'placeholder-key'

// Client for general use (follows RLS)
export const supabase = createClient(finalUrl, finalAnonKey)

// Client for server-side trusted operations (bypasses RLS)
export const supabaseAdmin = (supabaseServiceKey && isValidUrl(finalUrl))
  ? createClient(finalUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase
