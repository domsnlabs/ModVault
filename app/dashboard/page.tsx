'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModCard } from '@/components/mod-card'
import { Mod } from '@/lib/types'

export default function DashboardPage() {
  const [mods, setMods] = useState<Mod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('mods')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setMods(data || [])
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load your mods')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMods()
  }, [])

  if (isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
        Loading your mods...
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Your Mods</h1>
          <Link href="/mods/create">
            <Button>Create New Mod</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {mods.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No mods yet</h2>
            <p className="text-muted-foreground mb-4">
              Create your first mod to get started
            </p>
            <Link href="/mods/create">
              <Button>Create Your First Mod</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mods.map((mod) => (
              <ModCard key={mod.id} mod={mod} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
