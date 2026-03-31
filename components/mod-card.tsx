import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, Heart, Package, Palette, Sparkles, Box, Database, Plug, Star } from 'lucide-react'
import type { Mod } from '@/lib/types'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  puzzle: Package,
  palette: Palette,
  sparkles: Sparkles,
  package: Box,
  database: Database,
  plug: Plug,
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

interface ModCardProps {
  mod: Mod
  index?: number
}

export function ModCard({ mod, index = 0 }: ModCardProps) {
  const CategoryIcon = mod.categories?.icon 
    ? categoryIcons[mod.categories.icon] || Package 
    : Package

  const averageRating = mod.reviews?.length 
    ? mod.reviews.reduce((acc, r) => acc + r.rating, 0) / mod.reviews.length 
    : 0

  return (
    <Link href={`/mods/${mod.slug}`}>
      <Card 
        className="group h-full overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      >
        {/* Header Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
          {mod.header_url ? (
            <img
              src={mod.header_url}
              alt={mod.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CategoryIcon className="h-12 w-12 text-muted-foreground/30 transition-all duration-300 group-hover:scale-110 group-hover:text-primary/50" />
            </div>
          )}
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Icon overlay */}
          <div className="absolute -bottom-6 left-4 z-10">
            <div className="h-14 w-14 rounded-lg border-4 border-card bg-secondary p-2 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:scale-105">
              {mod.icon_url ? (
                <img
                  src={`/api/file?pathname=${encodeURIComponent(mod.icon_url)}`}
                  alt=""
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <CategoryIcon className="h-full w-full text-muted-foreground" />
              )}
            </div>
          </div>
          
          {/* Category badge */}
          {mod.categories && (
            <div className="absolute top-3 right-3 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white border-0">
                {mod.categories.name}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="pt-8 pb-4">
          {/* Title and Author */}
          <div className="mb-3">
            <h3 className="line-clamp-1 text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
              {mod.title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">by</span>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5 transition-transform duration-200 group-hover:scale-110">
                  <AvatarImage src={mod.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                    {mod.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {mod.profiles?.display_name || mod.profiles?.username}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {mod.description}
          </p>

          {/* Footer Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 group-hover:text-primary">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">{formatNumber(mod.downloads_count)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 group-hover:text-red-400">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">{formatNumber(mod.follows_count)}</span>
              </div>
            </div>

            {/* Rating Stars */}
            {averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Versions info - shows on hover */}
          {(mod as any).mod_versions?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {(mod as any).mod_versions[0]?.loaders?.slice(0, 2).map((loader: string) => (
                <Badge key={loader} variant="outline" className="text-xs capitalize">
                  {loader}
                </Badge>
              ))}
              {(mod as any).mod_versions[0]?.game_versions?.slice(0, 2).map((version: string) => (
                <Badge key={version} variant="outline" className="text-xs bg-primary/10 border-primary/20">
                  {version}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function ModCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border-border bg-card">
      <div className="aspect-[16/9] animate-pulse bg-gradient-to-br from-secondary to-secondary/50" />
      <CardContent className="pt-8 pb-4">
        <div className="mb-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-secondary" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-secondary" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
          </div>
          <div className="h-5 w-20 animate-pulse rounded bg-secondary" />
        </div>
      </CardContent>
    </Card>
  )
}
