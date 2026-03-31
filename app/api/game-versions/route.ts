import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('game_versions')
      .select('*')
      .order('version', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching game versions:', error)
    return NextResponse.json({ error: 'Failed to fetch game versions' }, { status: 500 })
  }
}
