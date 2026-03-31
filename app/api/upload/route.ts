import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_FILE_TYPES = [
  'application/java-archive', // .jar
  'application/zip', // .zip
  'application/x-zip-compressed',
  'application/octet-stream',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'mod' | 'icon' | 'header'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB.' }, { status: 400 })
    }

    // Different validation for different file types
    if (type === 'mod') {
      // Validate mod file types
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['jar', 'zip'].includes(ext || '')) {
        return NextResponse.json({ error: 'Invalid file type. Only .jar and .zip files are allowed.' }, { status: 400 })
      }
    } else if (type === 'icon' || type === 'header') {
      // Validate image types
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
      }
      // Max 5MB for images
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Maximum size is 5MB.' }, { status: 400 })
      }
    }

    // Create a unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const pathname = `${user.id}/${type}/${timestamp}-${safeName}`

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'private',
    })

    return NextResponse.json({ 
      pathname: blob.pathname,
      url: blob.url,
      size: file.size,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
