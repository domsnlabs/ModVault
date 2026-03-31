import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const supabase = await createClient()

    const { data: mod, error: modError } = await supabase
      .from('mods')
      .select(
        `
        *,
        profiles:user_id(id, username, avatar_url, bio),
        categories(name),
        mod_versions(
          id,
          version_number,
          changelog,
          status,
          created_at,
          mod_files(id, filename, file_size, downloads_count, created_at)
        )
      `
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (modError || !mod) {
      return NextResponse.json(
        { error: 'Mod not found' },
        { status: 404 }
      )
    }

    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select(
        `
        *,
        profiles:user_id(username, avatar_url)
      `
      )
      .eq('mod_id', mod.id)
      .order('created_at', { ascending: false })

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
        *,
        profiles:user_id(username, avatar_url)
      `
      )
      .eq('mod_id', mod.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      mod,
      reviews: reviews || [],
      comments: comments || [],
    })
  } catch (error) {
    console.error('Error fetching mod:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mod' },
      { status: 500 }
    )
  }
}
