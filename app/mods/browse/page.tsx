'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModCard } from '@/components/mod-card'
import { CategorySidebar } from '@/components/category-sidebar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Category, Mod } from '@/lib/types'
import { Search, FolderOpen } from 'lucide-react'

function BrowseContent() {
  const searchParams = useSearchParams()
  const [mods, setMods] = useState<Mod[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        console.error('Error:', err)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchMods = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        params.append('page', page.toString())

        const res = await fetch(`/api/mods/search?${params}`)
        if (!res.ok) throw new Error('Failed to fetch mods')
        const data = await res.json()
        setMods(data.mods || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } catch (err) {
        console.error('Error:', err)
        setMods([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMods()
  }, [searchQuery, selectedCategory, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Browse Projects</h1>
        <p className="text-muted-foreground mb-8">
          Discover thousands of community-created mods, resource packs, and more
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
            ) : mods.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2 mt-4 text-foreground">
                  No projects found
                </h2>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {mods.map((mod) => (
                    <ModCard key={mod.id} mod={mod} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            variant={p === page ? 'default' : 'outline'}
                            onClick={() => setPage(p)}
                            className="w-10"
                          >
                            {p}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPage(Math.min(totalPages, page + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-12 text-center">Loading...</div>}>
          <BrowseContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
