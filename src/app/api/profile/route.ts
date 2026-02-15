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

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    return NextResponse.json(data || {})
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

    const body = await req.json()
    
    // Explicitly pick only the fields we want to update/insert
    const profileData = {
      full_name: body.full_name,
      phone: body.phone,
      address: body.address,
      shop_name: body.shop_name,
      shop_logo_url: body.shop_logo_url,
      dashboard_config: body.dashboard_config,
    }

    console.log('Updating profile for user:', userId, 'with data:', profileData)
    
    // Check if profile exists
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile existence:', checkError)
      throw checkError
    }

    if (existing) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', userId)
      
      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }
    } else {
      const { error } = await supabase
        .from('profiles')
        .insert({
          clerk_id: userId,
          ...profileData
        })
      
      if (error) {
        console.error('Error inserting profile:', error)
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Error in Profile POST:', err)
    return NextResponse.json({ 
      error: err.message || 'Internal Server Error',
      code: err.code,
      details: typeof err === 'object' ? { ...err } : err
    }, { status: 500 })
  }
}

// PUT method uses the same logic as POST for updates
export async function PUT(req: Request) {
  return POST(req)
}
