import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const supabase = supabaseAdmin

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get profile id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json([], { status: 200 })
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching payment methods:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const { id, ...data } = body

    const payload: any = {
      profile_id: profile.id,
      type: data.type,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString()
    }

    if (data.type === 'promptpay') {
      payload.promptpay_type = data.promptpay_type
      payload.promptpay_number = data.promptpay_number
      payload.bank_name = null
      payload.account_name = null
      payload.account_number = null
    } else {
      payload.promptpay_type = null
      payload.promptpay_number = null
      payload.bank_name = data.bank_name
      payload.account_name = data.account_name
      payload.account_number = data.account_number
    }

    if (id) {
      const { error } = await supabase
        .from('payment_methods')
        .update({
          ...payload,
          created_at: undefined
        })
        .eq('id', id)
        .eq('profile_id', profile.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('payment_methods')
        .insert(payload)
      
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .eq('profile_id', profile.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
