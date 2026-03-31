import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ModCard, ModCardSkeleton } from '@/components/mod-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Package, 
  Palette, 
  Sparkles, 
  Box, 
  ArrowRight,
  Download,
  Users,
  FolderOpen
} from 'lucide-react'
import type { Mod, Category } from '@/lib/types'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  puzzle: Package,
  palette: Palette,
  sparkles: Sparkles,
  package: Box,
}

async function getFeaturedMods(): Promise<Mod[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mods')
    .select(`
      *,
      profiles (*),
      categories (*),
      reviews (rating)
    `)
    .eq('status', 'active')
    .order('downloads_count', { ascending: false })
    .limit(8)
  
  return data || []
}

async function getRecentMods(): Promise<Mod[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mods')
    .select(`
      *,
      profiles (*),
      categories (*),
      reviews (rating)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)
  
  return data || []
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  return data || []
}

async function getStats() {
  const supabase = await createClient()
  
  const [modsCount, profilesCount] = await Promise.all([
    supabase.from('mods').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  
  const { data: downloadStats } = await supabase
    .from('mods')
    .select('downloads_count')
  
  const totalDownloads = downloadStats?.reduce((acc, m) => acc + (m.downloads_count || 0), 0) || 0
  
  return {
    mods: modsCount.count || 0,
    users: profilesCount.count || 0,
    downloads: totalDownloads,
  }
}

export default async function HomePage() {
  const [featuredMods, recentMods, categories, stats] = await Promise.all([
    getFeaturedMods(),
    getRecentMods(),
    getCategories(),
    getStats(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Discover Minecraft
                <span className="text-primary"> Mods & More</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground">
                Browse thousands of mods, resource packs, shaders, and modpacks. 
                Upload your creations and share them with the community.
              </p>
              
              {/* Search Bar */}
              <form action="/search" method="GET" className="mt-8">
                <div className="relative mx-auto max-w-xl">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search mods, resource packs, shaders..."
                    className="h-14 pl-12 pr-32 text-base bg-card border-border"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{stats.mods.toLocaleString()}</span>
                  <span className="text-muted-foreground">Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{stats.users.toLocaleString()}</span>
                  <span className="text-muted-foreground">Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{stats.downloads.toLocaleString()}</span>
                  <span className="text-muted-foreground">Downloads</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
              <Button variant="ghost" asChild>
                <Link href="/mods">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category) => {
                const Icon = category.icon ? categoryIcons[category.icon] || Package : Package
                return (
                  <Link
                    key={category.id}
                    href={`/mods?category=${category.slug}`}
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Mods Section */}
        <section className="border-t border-border bg-secondary/20 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Projects</h2>
                <p className="text-muted-foreground">Most popular mods and resource packs</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/mods?sort=downloads">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {featuredMods.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredMods.map((mod) => (
                  <ModCard key={mod.id} mod={mod} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No projects yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Be the first to upload a mod or resource pack!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/create">Create Project</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Recent Mods Section */}
        {recentMods.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Recently Added</h2>
                  <p className="text-muted-foreground">Fresh content from our community</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/mods?sort=newest">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recentMods.map((mod) => (
                  <ModCard key={mod.id} mod={mod} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="border-t border-border bg-card py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to share your creation?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join our community of creators and share your mods, resource packs, 
                and more with players around the world.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/docs">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
