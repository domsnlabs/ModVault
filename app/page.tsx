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
  FolderOpen,
  Zap,
  Shield,
  Globe
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
      reviews (rating),
      mod_versions (game_versions, loaders)
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
      reviews (rating),
      mod_versions (game_versions, loaders)
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
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Discover Minecraft
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> Mods & More</span>
                </h1>
              </div>
              <p className="mt-6 text-pretty text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Browse thousands of mods, resource packs, shaders, and modpacks. 
                Upload your creations and share them with the community.
              </p>
              
              {/* Search Bar */}
              <form action="/search" method="GET" className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="relative mx-auto max-w-xl group">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search mods, resource packs, shaders..."
                    className="h-14 pl-12 pr-32 text-base bg-card border-border transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 transition-transform hover:scale-105"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                {[
                  { icon: Package, value: stats.mods, label: 'Projects' },
                  { icon: Users, value: stats.users, label: 'Users' },
                  { icon: Download, value: stats.downloads, label: 'Downloads' },
                ].map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="flex items-center gap-2 transition-transform hover:scale-105"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</span>
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl animate-pulse" />
            <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl animate-pulse delay-1000" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Zap, title: 'Fast Downloads', description: 'Lightning-fast CDN delivery for all your favorite mods' },
                { icon: Shield, title: 'Verified Content', description: 'All uploads are scanned and verified for safety' },
                { icon: Globe, title: 'Global Community', description: 'Join millions of players sharing creations worldwide' },
              ].map((feature, index) => (
                <div 
                  key={feature.title}
                  className="group text-center p-6 rounded-xl bg-card/50 border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-2xl font-bold text-foreground">Browse by Category</h2>
              <Button variant="ghost" asChild className="transition-transform hover:translate-x-1">
                <Link href="/mods/browse">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 6).map((category, index) => {
                const Icon = category.icon ? categoryIcons[category.icon] || Package : Package
                return (
                  <Link
                    key={category.id}
                    href={`/mods/browse?category=${category.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
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
                    <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Mods Section */}
        <section className="border-t border-border bg-secondary/20 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Projects</h2>
                <p className="text-muted-foreground">Most popular mods and resource packs</p>
              </div>
              <Button variant="outline" asChild className="transition-all hover:scale-105 hover:shadow-md">
                <Link href="/mods/browse?sort=downloads">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {featuredMods.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredMods.map((mod, index) => (
                  <ModCard key={mod.id} mod={mod} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center animate-in fade-in zoom-in duration-500">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No projects yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Be the first to upload a mod or resource pack!
                </p>
                <Button asChild className="mt-4 transition-transform hover:scale-105">
                  <Link href="/mods/create">Create Project</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Recent Mods Section */}
        {recentMods.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Recently Added</h2>
                  <p className="text-muted-foreground">Fresh content from our community</p>
                </div>
                <Button variant="outline" asChild className="transition-all hover:scale-105 hover:shadow-md">
                  <Link href="/mods/browse?sort=newest">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recentMods.map((mod, index) => (
                  <ModCard key={mod.id} mod={mod} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="border-t border-border bg-gradient-to-b from-card to-background py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to share your creation?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join our community of creators and share your mods, resource packs, 
                and more with players around the world.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="transition-all hover:scale-105">
                  <Link href="/mods/browse">Browse Projects</Link>
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
