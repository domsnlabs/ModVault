import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { collectionId, modId } = await request.json()

    if (!collectionId || !modId) {
      return NextResponse.json(
        { error: 'Collection ID and Mod ID are required' },
        { status: 400 }
      )
    }

    // Verify user owns this collection
    const { data: collection, error: collError } = await supabase
      .from('collections')
      .select('id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single()

    if (collError || !collection) {
      return NextResponse.json(
        { error: 'Collection not found or unauthorized' },
        { status: 404 }
      )
    }

    const { data: item, error } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        mod_id: modId,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error adding to collection:', error)
    return NextResponse.json(
      { error: 'Failed to add to collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      )
    }

    // Verify user owns the collection this item belongs to
    const { data: item } = await supabase
      .from('collection_items')
      .select('collection_id')
      .eq('id', itemId)
      .single()

    if (item) {
      const { data: collection } = await supabase
        .from('collections')
        .select('user_id')
        .eq('id', item.collection_id)
        .single()

      if (collection?.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from collection:', error)
    return NextResponse.json(
      { error: 'Failed to remove from collection' },
      { status: 500 }
    )
  }
}
