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

    const { version_id, filename, file_size, file_type, blob_pathname } = await request.json()

    if (!version_id || !filename || !blob_pathname) {
      return NextResponse.json(
        { error: 'Version ID, filename, and blob_pathname are required' },
        { status: 400 }
      )
    }

    // Get the mod from the version to verify ownership
    const { data: version, error: versionError } = await supabase
      .from('mod_versions')
      .select('mod_id, mods!inner(user_id)')
      .eq('id', version_id)
      .single()

    if (versionError || !version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }

    if ((version as any).mods.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Store file metadata in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('mod_files')
      .insert({
        version_id,
        filename,
        file_size: file_size || 0,
        file_type: file_type || 'application/octet-stream',
        blob_pathname,
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

// PATCH - increment download count
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('file_id')
    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Get the file to find its mod
    const { data: file, error: fileError } = await supabase
      .from('mod_files')
      .select('version_id, mod_versions!inner(mod_id)')
      .eq('id', fileId)
      .single()
    
    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Increment the mod's download count
    const { error: updateError } = await supabase.rpc('increment_downloads', {
      mod_id_param: (file as any).mod_versions.mod_id
    })
    
    if (updateError) {
      // Fallback if RPC doesn't exist - just update directly
      await supabase
        .from('mods')
        .update({ downloads_count: supabase.raw('downloads_count + 1') } as any)
        .eq('id', (file as any).mod_versions.mod_id)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing download:', error)
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 })
  }
}
