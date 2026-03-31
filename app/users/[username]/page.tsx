'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ModCard } from '@/components/mod-card'
import { Mod } from '@/lib/types'

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<any>(null)
  const [mods, setMods] = useState<Mod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${username}`)
        if (!res.ok) throw new Error('User not found')
        const data = await res.json()
        setProfile(data.profile)
        setMods(data.mods)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
        Loading profile...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/mods/browse" className="text-primary hover:underline">
            Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="border border-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-muted-foreground">@{profile.username}</p>
              {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {/* User Mods */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            Mods ({mods.length})
          </h2>
          {mods.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                This user hasn&apos;t created any mods yet
              </p>
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
    </div>
  )
}
