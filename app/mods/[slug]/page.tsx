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
  Package,
  FileArchive,
  ChevronDown,
  ExternalLink,
  Loader2,
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
  const [activeTab, setActiveTab] = useState<'description' | 'versions' | 'reviews'>('description')
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const fetchMod = async () => {
      try {
        const res = await fetch(`/api/mods/${slug}`)
        if (!res.ok) throw new Error('Mod not found')
        const data = await res.json()
        setMod(data.mod)
        setReviews(data.reviews)
        setComments(data.comments)
        // Auto-expand first version if exists
        if (data.mod?.mod_versions?.length > 0) {
          setExpandedVersion(data.mod.mod_versions[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mod')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMod()
  }, [slug])

  const handleDownload = async (file: any) => {
    if (!file.blob_pathname) return
    
    setDownloading(file.id)
    
    // Track download count
    try {
      await fetch(`/api/files?file_id=${file.id}`, { method: 'PATCH' })
    } catch (e) {
      console.error('Failed to track download:', e)
    }
    
    // Trigger download
    const link = document.createElement('a')
    link.href = `/api/file?pathname=${encodeURIComponent(file.blob_pathname)}`
    link.download = file.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => setDownloading(null), 1000)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !mod) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-foreground">Project Not Found</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/mods/browse">
                <Button className="transition-transform hover:scale-105">Back to Browse</Button>
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

  const latestVersion = (mod as any).mod_versions?.[0]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {mod.icon_url ? (
                <img
                  src={`/api/file?pathname=${encodeURIComponent(mod.icon_url)}`}
                  alt={mod.title}
                  className="w-32 h-32 rounded-xl object-cover shadow-lg border border-border transition-transform hover:scale-105"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-border">
                  <Package className="w-12 h-12 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 text-foreground">{mod.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{mod.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <Link 
                    href={`/users/${(mod as any).profiles?.username}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {(mod as any).profiles?.username}
                  </Link>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(mod.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="w-4 h-4" />
                    {mod.downloads_count.toLocaleString()} downloads
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-foreground font-medium">{avgRating}</span>
                      <span className="text-muted-foreground">({reviews.length})</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {latestVersion?.mod_files?.[0] && (
                    <Button
                      size="lg"
                      onClick={() => handleDownload(latestVersion.mod_files[0])}
                      disabled={downloading === latestVersion.mod_files[0].id}
                      className="gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                    >
                      {downloading === latestVersion.mod_files[0].id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                      Download {latestVersion.version_number}
                    </Button>
                  )}
                  <Button
                    variant={isFavorited ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`gap-2 transition-all hover:scale-105 ${isFavorited ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform ${isFavorited ? 'scale-110' : ''}`}
                      fill={isFavorited ? 'currentColor' : 'none'}
                    />
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex gap-1">
              {[
                { id: 'description', label: 'Description' },
                { id: 'versions', label: `Versions (${(mod as any).mod_versions?.length || 0})` },
                { id: 'reviews', label: `Reviews (${reviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    px-6 py-3 font-medium transition-all relative
                    ${activeTab === tab.id 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-left-4 duration-200" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Main Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  {mod.body ? (
                    <div className="prose prose-invert max-w-none bg-card border border-border rounded-xl p-6">
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
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No description provided</p>
                    </div>
                  )}
                </div>
              )}

              {/* Versions Tab */}
              {activeTab === 'versions' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  {(mod as any).mod_versions?.length > 0 ? (
                    (mod as any).mod_versions.map((version: ModVersion, index: number) => (
                      <div
                        key={version.id}
                        className="border border-border rounded-xl overflow-hidden bg-card transition-all hover:border-primary/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <button
                          onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <FileArchive className="w-10 h-10 text-primary" />
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-foreground">{version.version_number}</span>
                                <span className={`
                                  text-xs px-2 py-0.5 rounded-full font-medium
                                  ${version.status === 'release' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : version.status === 'beta'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }
                                `}>
                                  {version.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {(version as any).game_versions?.slice(0, 3).map((v: string) => (
                                  <span key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {v}
                                  </span>
                                ))}
                                {(version as any).game_versions?.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{(version as any).game_versions.length - 3} more
                                  </span>
                                )}
                                {(version as any).loaders?.map((l: string) => (
                                  <span key={l} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded capitalize">
                                    {l}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expandedVersion === version.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {expandedVersion === version.id && (
                          <div className="px-4 pb-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="pt-4 space-y-4">
                              {version.changelog && (
                                <div>
                                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Changelog</h4>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{version.changelog}</p>
                                </div>
                              )}
                              
                              {(version as any).game_versions?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Supported Minecraft Versions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(version as any).game_versions.map((v: string) => (
                                      <span key={v} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                        {v}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {(version as any).loaders?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Supported Loaders</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(version as any).loaders.map((l: string) => (
                                      <span key={l} className="text-sm bg-accent text-accent-foreground px-3 py-1 rounded-full capitalize">
                                        {l}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Files */}
                              {version.mod_files && version.mod_files.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-muted-foreground">Files</h4>
                                  {version.mod_files.map((file: any) => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <FileArchive className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                          <p className="font-medium text-foreground">{file.filename}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleDownload(file)}
                                        disabled={downloading === file.id}
                                        className="gap-2 transition-all hover:scale-105"
                                      >
                                        {downloading === file.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Download className="w-4 h-4" />
                                        )}
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground">
                                Released on {new Date(version.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No versions available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  {reviews.length > 0 ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl mb-6">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-foreground">{avgRating}</p>
                          <div className="flex gap-1 mt-1">
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
                          <p className="text-sm text-muted-foreground mt-1">{reviews.length} reviews</p>
                        </div>
                      </div>
                      {reviews.map((review: any, index: number) => (
                        <div 
                          key={review.id} 
                          className="border border-border rounded-xl p-4 bg-card animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {review.profiles?.avatar_url ? (
                                <img
                                  src={review.profiles.avatar_url}
                                  alt={review.profiles.username}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-foreground">
                                  {review.profiles?.username}
                                </p>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
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
                          {review.body && <p className="text-foreground">{review.body}</p>}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No reviews yet</p>
                      <p className="text-sm mt-1">Be the first to review this project!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              {/* Quick Download */}
              {latestVersion?.mod_files?.[0] && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-3">Quick Download</h3>
                  <Button
                    className="w-full gap-2 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
                    onClick={() => handleDownload(latestVersion.mod_files[0])}
                    disabled={downloading === latestVersion.mod_files[0].id}
                  >
                    {downloading === latestVersion.mod_files[0].id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {latestVersion.mod_files[0].filename}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {(latestVersion.mod_files[0].file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Project Info */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Project Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{new Date(mod.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="text-foreground">{new Date(mod.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloads</span>
                    <span className="text-foreground">{mod.downloads_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versions</span>
                    <span className="text-foreground">{(mod as any).mod_versions?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-3">Author</h3>
                <Link 
                  href={`/users/${(mod as any).profiles?.username}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{(mod as any).profiles?.username}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      View profile <ExternalLink className="w-3 h-3" />
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
