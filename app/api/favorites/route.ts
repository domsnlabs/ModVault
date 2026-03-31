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

    const { modId } = await request.json()

    if (!modId) {
      return NextResponse.json(
        { error: 'Mod ID is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('mod_id', modId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Already favorited, remove it
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('mod_id', modId)
        .eq('user_id', user.id)

      if (error) throw error
      return NextResponse.json({ favorited: false })
    } else {
      // Not favorited, add it
      const { error } = await supabase
        .from('favorites')
        .insert({
          mod_id: modId,
          user_id: user.id,
        })

      if (error) throw error
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const modId = searchParams.get('modId')

    if (!modId) {
      return NextResponse.json(
        { error: 'Mod ID is required' },
        { status: 400 }
      )
    }

    const { data: favorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('mod_id', modId)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ favorited: !!favorite })
  } catch (error) {
    console.error('Error checking favorite:', error)
    return NextResponse.json({ favorited: false })
  }
}
