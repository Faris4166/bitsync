import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

const supabase = supabaseAdmin

export async function getProfile() {
  const { userId } = await auth()
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', JSON.stringify(error, null, 2))
  }
  
  return data
}

export async function getPaymentMethods() {
  const { userId } = await auth()
  if (!userId) return []

  const profile = await getProfile()
  if (!profile) return []

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }

  return data
}
