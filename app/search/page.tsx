'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModCard } from '@/components/mod-card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Mod } from '@/lib/types'
import { Search, FolderOpen } from 'lucide-react'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [mods, setMods] = useState<Mod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  useEffect(() => {
    const fetchMods = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)

        const res = await fetch(`/api/mods/search?${params}`)
        if (!res.ok) throw new Error('Failed to fetch mods')
        const data = await res.json()
        setMods(data.mods || [])
      } catch (err) {
        console.error('Error:', err)
        setMods([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMods()
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Update the URL
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    window.history.pushState({}, '', url)
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Search Results</h1>
        <p className="text-muted-foreground mb-8">
          {searchQuery ? `Searching for "${searchQuery}"` : 'Enter a search term to find projects'}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search mods, resource packs, shaders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Searching...</div>
        ) : mods.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2 mt-4 text-foreground">
              No results found
            </h2>
            <p className="text-muted-foreground">
              Try a different search term or browse all projects
            </p>
            <Button asChild className="mt-4">
              <a href="/mods/browse">Browse All</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mods.map((mod) => (
              <ModCard key={mod.id} mod={mod} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
