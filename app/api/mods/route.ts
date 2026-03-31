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

    const { title, description, body, categoryId, icon_url, header_url } =
      await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const { data: mod, error } = await supabase
      .from('mods')
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        body,
        category_id: categoryId,
        icon_url,
        header_url,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(mod)
  } catch (error) {
    console.error('Error creating mod:', error)
    return NextResponse.json(
      { error: 'Failed to create mod' },
      { status: 500 }
    )
  }
}
