'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Mod, ModVersion } from '@/lib/types'
import {
  Download,
  Heart,
  Star,
  Calendar,
  User,
} from 'lucide-react'

export default function ModDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [mod, setMod] = useState<Mod | null>(null)
  const [reviews, setReviews] = useState([])
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const fetchMod = async () => {
      try {
        const res = await fetch(`/api/mods/${slug}`)
        if (!res.ok) throw new Error('Mod not found')
        const data = await res.json()
        setMod(data.mod)
        setReviews(data.reviews)
        setComments(data.comments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mod')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMod()
  }, [slug])

  const handleDownload = (fileId: string, filename: string) => {
    // Trigger download
    const link = document.createElement('a')
    link.href = `/api/file?pathname=mods/${mod?.id}/${fileId}/${filename}`
    link.download = filename
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="py-12 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
            Loading mod...
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !mod) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-2 text-foreground">Project Not Found</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/mods/browse">
                <Button>Back to Browse</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length).toFixed(1)
      : 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-6 mb-6">
            {mod.icon_url && (
              <img
                src={mod.icon_url}
                alt={mod.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{mod.title}</h1>
              <p className="text-muted-foreground mb-4">{mod.description}</p>
              <div className="flex items-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {(mod as any).profiles?.username}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(mod.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {mod.downloads_count} downloads
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={isFavorited ? 'default' : 'outline'}
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="gap-2"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isFavorited ? 'currentColor' : 'none'}
                  />
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-8">
          <div className="flex gap-6">
            <button className="px-4 py-2 border-b-2 border-primary font-semibold">
              Versions
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
              Reviews
            </button>
            <button className="px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
              Comments
            </button>
          </div>
        </div>

        {/* Description */}
        {mod.body && (
          <div className="prose prose-invert max-w-none mb-12">
            <div
              className="text-foreground whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: mod.body
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;'),
              }}
            />
          </div>
        )}

        {/* Versions */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold">Versions</h2>
          {(mod as any).mod_versions?.map((version: ModVersion) => (
            <div
              key={version.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {version.version_number}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {version.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(version.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {version.mod_files && version.mod_files.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        version.mod_files[0].id,
                        version.mod_files[0].filename
                      )
                    }
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                )}
              </div>
              {version.changelog && (
                <p className="text-sm text-muted-foreground mt-2">
                  {version.changelog}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Reviews ({reviews.length})
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(parseFloat(avgRating as string))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating} / 5.0
              </span>
            </div>
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {review.profiles?.avatar_url && (
                        <img
                          src={review.profiles.avatar_url}
                          alt={review.profiles.username}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold">
                          {review.profiles?.username}
                        </p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.body && <p className="text-sm">{review.body}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </main>
      <Footer />
    </div>
  )
}
