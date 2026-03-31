'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function CollectionsPage() {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collections')
        if (!res.ok) throw new Error('Failed to fetch collections')
        const data = await res.json()
        setCollections(data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [])

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      if (!res.ok) throw new Error('Failed to create collection')
      const newCollection = await res.json()
      setCollections([newCollection, ...collections])
      setTitle('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      alert('Failed to create collection')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Collections</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Collection'}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateCollection}
            className="border border-border rounded-lg p-6 mb-8 space-y-4"
          >
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="title"
                placeholder="e.g., PvP Mods"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe your collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              No collections yet
            </h2>
            <p className="text-muted-foreground">
              Create your first collection to organize mods
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((collection: any) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
              >
                <div className="border border-border rounded-lg p-6 hover:bg-muted/50 transition cursor-pointer">
                  <h3 className="text-lg font-semibold mb-2">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {collection.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {collection.collection_items?.length || 0} mods
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
