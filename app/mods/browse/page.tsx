'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { CategorySidebar } from '@/components/category-sidebar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Category, Mod } from '@/lib/types'
import { Search, FolderOpen, SlidersHorizontal, Grid3X3, LayoutList, Loader2 } from 'lucide-react'

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Browse Projects</h1>
          <p className="text-muted-foreground mb-8">
            Discover thousands of community-created mods, resource packs, and more
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex gap-2">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search mods, resource packs, shaders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" className="h-12 px-6 transition-transform hover:scale-105">
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="h-12 lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'} animate-in fade-in slide-in-from-left-4 duration-500`}>
            <div className="sticky top-4">
              <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : `${mods.length} projects found`}
              </p>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                >
                  <Grid3X3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}`} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                >
                  <LayoutList className={`w-4 h-4 ${viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'}`} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <ModCardSkeleton key={i} />
                ))}
              </div>
            ) : mods.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card animate-in fade-in zoom-in duration-500">
                <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-foreground">
                  No projects found
                </h2>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 mb-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {mods.map((mod, index) => (
                    <ModCard key={mod.id} mod={mod} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="transition-all hover:scale-105"
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = page <= 3 ? i + 1 : page - 2 + i
                        if (pageNum > totalPages || pageNum < 1) return null
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? 'default' : 'outline'}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 transition-all ${pageNum === page ? 'scale-110' : 'hover:scale-105'}`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="transition-all hover:scale-105"
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        }>
          <BrowseContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
