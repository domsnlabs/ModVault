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

    const { modId, version_number, changelog, status } = await request.json()

    if (!modId || !version_number) {
      return NextResponse.json(
        { error: 'Mod ID and version number are required' },
        { status: 400 }
      )
    }

    // Verify user owns this mod
    const { data: mod, error: modError } = await supabase
      .from('mods')
      .select('id')
      .eq('id', modId)
      .eq('user_id', user.id)
      .single()

    if (modError || !mod) {
      return NextResponse.json(
        { error: 'Mod not found or unauthorized' },
        { status: 404 }
      )
    }

    const { data: version, error } = await supabase
      .from('mod_versions')
      .insert({
        mod_id: modId,
        version_number,
        changelog,
        status: status || 'release',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(version)
  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    )
  }
}
