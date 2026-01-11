import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!profile) return NextResponse.json([])

    const { data, error } = await supabaseAdmin
      .from('receipts')
      .select('customer_name, customer_phone, created_at')
      .eq('profile_id', profile.id)
      // Order by created_at desc so we see the most recent details first
      .order('created_at', { ascending: false })

    if (error) throw error

    // Deduplicate by name, keeping the first one encountered (which is the latest due to sorting)
    const uniqueCustomers = new Map()
    data?.forEach((receipt: any) => {
        const name = receipt.customer_name?.trim()
        if (name && !uniqueCustomers.has(name)) {
            uniqueCustomers.set(name, {
                name: name,
                phone: receipt.customer_phone || ''
            })
        }
    })

    return NextResponse.json(Array.from(uniqueCustomers.values()))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
