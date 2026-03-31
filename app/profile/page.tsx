'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        })
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      alert('Failed to update profile')
      console.error('Error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                Bio
              </label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium mb-2">
                Avatar URL
              </label>
              <Input
                id="avatar_url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    avatar_url: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-6 mb-6">
                {profile?.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.display_name || profile?.username}
                  </h2>
                  <p className="text-muted-foreground">@{profile?.username}</p>
                </div>
              </div>

              {profile?.bio && (
                <p className="text-sm mb-4">{profile.bio}</p>
              )}

              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{profile?.mods_count || 0}</p>
                <p className="text-sm text-muted-foreground">Mods Created</p>
              </div>
              <div className="border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{profile?.followers || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
