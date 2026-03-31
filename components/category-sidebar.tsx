'use client'

import { Package, Palette, Sparkles, Box, Database, Plug, LayoutGrid } from 'lucide-react'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  puzzle: Package,
  palette: Palette,
  sparkles: Sparkles,
  package: Box,
  database: Database,
  plug: Plug,
}

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategorySidebar({ categories, selectedCategory, onCategoryChange }: CategorySidebarProps) {
  return (
    <aside className="w-full shrink-0">
      <div className="sticky top-20 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h2>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
              selectedCategory === 'all'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Categories
          </button>
          
          {categories.map((category) => {
            const Icon = category.icon ? categoryIcons[category.icon] || Package : Package
            const isActive = selectedCategory === category.slug
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
