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

    const { versionId, modId } = await request.json()

    if (!versionId || !modId) {
      return NextResponse.json(
        { error: 'Version ID and Mod ID are required' },
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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Store file metadata in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('mod_files')
      .insert({
        version_id: versionId,
        filename: file.name,
        file_size: file.size,
        file_type: file.type,
        blob_pathname: `mods/${modId}/${versionId}/${file.name}`,
      })
      .select()
      .single()

    if (fileError) throw fileError

    return NextResponse.json(fileRecord)
  } catch (error) {
    console.error('Error registering file:', error)
    return NextResponse.json(
      { error: 'Failed to register file' },
      { status: 500 }
    )
  }
}
