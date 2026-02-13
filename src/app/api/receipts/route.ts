import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const supabase = supabaseAdmin

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
        // Fetch single receipt
        const { data, error } = await supabase
            .from('receipts')
            .select('*')
            .eq('id', id)
            .single()
        
        if (error) throw error
        return NextResponse.json(data)
    }

    // Fetch list of receipts for the user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!profile) return NextResponse.json([])

    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const body = await req.json()
    const { 
        id, 
        customer_name, 
        customer_phone, 
        items, 
        labor_cost, 
        subtotal, 
        total_amount, 
        payment_info 
    } = body

    // Generate receipt number if new
    const receipt_number = body.receipt_number || `REC-${Date.now().toString().slice(-6)}`

    const payload = {
        profile_id: profile.id,
        receipt_number,
        customer_name,
        customer_phone,
        items,
        labor_cost,
        subtotal,
        total_amount,
        payment_info,
        updated_at: new Date().toISOString()
    }

    if (id) {
        const { data, error } = await supabase
            .from('receipts')
            .update(payload)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return NextResponse.json(data)
    } else {
        const { data, error } = await supabase
            .from('receipts')
            .insert({ ...payload, created_at: new Date().toISOString() })
            .select()
            .single()
        
        if (error) throw error

        // Inventory Stock Decrement Logic
        if (items && Array.isArray(items)) {
            for (const item of items) {
                // Only decrement if product ID exists and stock tracking is enabled for this item
                if (item.id && item.track_stock !== false) {
                    const quantityToSubtract = Number(item.quantity) || 0
                    if (quantityToSubtract > 0) {
                        try {
                            // Fetch current quantity
                            const { data: product, error: fetchError } = await supabase
                                .from('products')
                                .select('quantity')
                                .eq('id', item.id)
                                .eq('profile_id', profile.id)
                                .single()
                            
                            if (!fetchError && product) {
                                const newQuantity = Math.max(0, product.quantity - quantityToSubtract)
                                
                                // Update quantity
                                await supabase
                                    .from('products')
                                    .update({ 
                                        quantity: newQuantity,
                                        updated_at: new Date().toISOString()
                                    })
                                    .eq('id', item.id)
                                    .eq('profile_id', profile.id)
                                
                                console.log(`Successfully decremented stock for product ${item.id}: ${product.quantity} -> ${newQuantity}`)
                            }
                        } catch (invErr) {
                            console.error(`Error syncing inventory for item ${item.id}:`, invErr)
                            // We don't throw here to avoid failing the whole receipt save if inventory sync fails
                        }
                    }
                }
            }
        }

        return NextResponse.json(data)
    }
} catch (err: any) {
    console.error('Receipt POST Exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
