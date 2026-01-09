import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const supabase = supabaseAdmin

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.json()
    const { fileName, fileType, base64 } = formData

    if (!base64) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 })
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64, 'base64')
    
    // Define file path
    const filePath = `${userId}/${Date.now()}-${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('shop-assets')
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: true
      })

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shop-assets')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
