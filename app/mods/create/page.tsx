'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModForm from '@/components/mod-form'
import { Category } from '@/lib/types'

export default function CreateModPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create mod')
      }

      const mod = await res.json()
      router.push(`/mods/${mod.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Create New Mod</h1>
        <p className="text-muted-foreground mb-8">
          Share your creation with the Minecraft community
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {categories.length > 0 ? (
          <ModForm
            categories={categories}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        ) : (
          <div className="text-center py-8">Loading categories...</div>
        )}
      </div>
    </div>
  )
}
