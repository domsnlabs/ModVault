import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, Heart, Package, Palette, Sparkles, Box, Database, Plug } from 'lucide-react'
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
}

export function ModCard({ mod }: ModCardProps) {
  const CategoryIcon = mod.categories?.icon 
    ? categoryIcons[mod.categories.icon] || Package 
    : Package

  const averageRating = mod.reviews?.length 
    ? mod.reviews.reduce((acc, r) => acc + r.rating, 0) / mod.reviews.length 
    : 0

  return (
    <Link href={`/mods/${mod.slug}`}>
      <Card className="group h-full overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        {/* Header Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          {mod.header_url ? (
            <img
              src={mod.header_url}
              alt={mod.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CategoryIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {/* Icon overlay */}
          <div className="absolute -bottom-6 left-4">
            <div className="h-14 w-14 rounded-lg border-4 border-card bg-secondary p-2 shadow-lg">
              {mod.icon_url ? (
                <img
                  src={mod.icon_url}
                  alt=""
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <CategoryIcon className="h-full w-full text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-8 pb-4">
          {/* Title and Author */}
          <div className="mb-3">
            <h3 className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {mod.title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">by</span>
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
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
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Download className="h-4 w-4" />
                <span className="text-sm">{formatNumber(mod.downloads_count)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{formatNumber(mod.follows_count)}</span>
              </div>
            </div>
            
            {mod.categories && (
              <Badge variant="secondary" className="text-xs">
                {mod.categories.name}
              </Badge>
            )}
          </div>

          {/* Rating Stars */}
          {averageRating > 0 && (
            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-primary text-primary'
                      : 'fill-muted text-muted'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                ({mod.reviews?.length || 0})
              </span>
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
      <div className="aspect-[16/9] animate-pulse bg-secondary" />
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
