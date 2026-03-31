import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 12

    const supabase = await createClient()

    // First get category ID if category slug is provided
    let categoryId: string | null = null
    if (categorySlug && categorySlug !== 'all') {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      
      categoryId = category?.id || null
    }

    let query = supabase
      .from('mods')
      .select(
        `
        *,
        profiles:user_id(id, username, display_name, avatar_url),
        categories:category_id(id, name, slug, icon),
        reviews(rating)
      `,
        { count: 'exact' }
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: mods, error, count } = await query.range(from, to)

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      mods: mods || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching mods:', error)
    return NextResponse.json({
      mods: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      error: 'Failed to fetch mods'
    })
  }
}
