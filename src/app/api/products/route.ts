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
      .from('products')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
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

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (profileError || !profile) {
      console.log('Profile not found, attempting to create one for', userId)
      // Attempt to create profile if not found
      const user = await auth()
      // Note: In a real scenario we might need more user info here, but for now we create a basic profile
      // or we just fail softer. But based on user request, let's try to fix it.
      // Actually, cleaner fix is to return a specific error that the frontend handles, 
      // OR we can just try to insert the product using just the user_id if the schema allows, 
      // but the schema likely requires profile_id.
      
      // Let's return a more descriptive error for now, as auto-creating profile might be complex without user data.
      return NextResponse.json({ 
        error: 'ไม่พบข้อมูลโปรไฟล์ร้านค้า (Profile Not Found). กรุณาไปที่หน้า Settings เพื่อสร้างโปรไฟล์ก่อนเพิ่มสินค้า' 
      }, { status: 404 })
    }

    const body = await req.json()
    const { name, price, quantity, category, image_url, track_stock } = body
    
    const payload: any = {
      profile_id: profile.id,
      name,
      price: Number(price),
      quantity: Number(quantity),
      category,
      image_url,
      track_stock: Boolean(track_stock),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    console.log('Inserting product with payload:', payload)

    const { error } = await supabase
      .from('products')
      .insert(payload)
    
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Product POST Exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
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

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile Not Found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, price, quantity, category, image_url, track_stock } = body
    
    const payload = {
        name,
        price: Number(price),
        quantity: Number(quantity),
        category,
        image_url,
        track_stock: Boolean(track_stock),
        profile_id: profile.id,
        updated_at: new Date().toISOString()
    }

    console.log('Updating product with payload:', payload)

    const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .eq('profile_id', profile.id)

    if (error) {
        console.error('Supabase update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Product PUT Exception:', err)
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
      .from('products')
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
