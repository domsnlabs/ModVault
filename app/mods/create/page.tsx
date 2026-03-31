'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  X, 
  FileArchive, 
  Check,
  ChevronDown,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react'
import { Category } from '@/lib/types'

interface GameVersion {
  id: string
  version: string
  version_type: string
}

interface ModLoader {
  id: string
  name: string
  slug: string
}

export default function CreateModPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [gameVersions, setGameVersions] = useState<GameVersion[]>([])
  const [modLoaders, setModLoaders] = useState<ModLoader[]>([])
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [selectedLoaders, setSelectedLoaders] = useState<string[]>([])
  const [versionNumber, setVersionNumber] = useState('1.0.0')
  const [changelog, setChangelog] = useState('')
  const [releaseType, setReleaseType] = useState<'release' | 'beta' | 'alpha'>('release')
  
  // Files
  const [modFile, setModFile] = useState<File | null>(null)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Download option
  const [downloadType, setDownloadType] = useState<'upload' | 'link'>('upload')
  const [externalUrl, setExternalUrl] = useState('')
  
  // Dropdowns
  const [showVersionDropdown, setShowVersionDropdown] = useState(false)
  const [showLoaderDropdown, setShowLoaderDropdown] = useState(false)
  
  // Check if resource pack (loaders not required)
  const isResourcePack = categories.find(c => c.id === categoryId)?.slug === 'resource-packs'
  
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/game-versions').then(r => r.json()),
      fetch('/api/mod-loaders').then(r => r.json())
    ]).then(([cats, versions, loaders]) => {
      setCategories(cats)
      setGameVersions(versions)
      setModLoaders(loaders)
    })
  }, [])

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setIconPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setBannerPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.jar') || file.name.endsWith('.zip'))) {
      setModFile(file)
    }
  }, [])

  const toggleVersion = (version: string) => {
    setSelectedVersions(prev => 
      prev.includes(version) 
        ? prev.filter(v => v !== version)
        : [...prev, version]
    )
  }

  const toggleLoader = (loader: string) => {
    setSelectedLoaders(prev => 
      prev.includes(loader) 
        ? prev.filter(l => l !== loader)
        : [...prev, loader]
    )
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)
  }

  const handleSubmit = async () => {
    // Validate
    if (downloadType === 'upload' && !modFile) {
      alert('Please upload a file')
      return
    }
    if (downloadType === 'link' && !externalUrl) {
      alert('Please enter a download URL')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 1. Upload icon if provided
      let iconUrl = null
      if (iconFile) {
        const iconFormData = new FormData()
        iconFormData.append('file', iconFile)
        const iconRes = await fetch('/api/upload', {
          method: 'POST',
          body: iconFormData
        })
        if (iconRes.ok) {
          const iconData = await iconRes.json()
          iconUrl = iconData.pathname
        }
      }

      // 2. Upload banner if provided
      let bannerUrl = null
      if (bannerFile) {
        const bannerFormData = new FormData()
        bannerFormData.append('file', bannerFile)
        const bannerRes = await fetch('/api/upload', {
          method: 'POST',
          body: bannerFormData
        })
        if (bannerRes.ok) {
          const bannerData = await bannerRes.json()
          bannerUrl = bannerData.pathname
        }
      }

      // 3. Create the mod
      const slug = generateSlug(title)
      const modRes = await fetch('/api/mods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          body,
          category_id: categoryId || null,
          icon_url: iconUrl,
          banner_url: bannerUrl
        })
      })
      
      if (!modRes.ok) {
        const error = await modRes.json()
        throw new Error(error.error || 'Failed to create project')
      }
      
      const mod = await modRes.json()

      // 4. Create version
      const versionRes = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mod_id: mod.id,
          version_number: versionNumber,
          changelog,
          status: releaseType,
          game_versions: selectedVersions,
          loaders: isResourcePack ? [] : selectedLoaders
        })
      })
      
      if (!versionRes.ok) {
        const error = await versionRes.json()
        throw new Error(error.error || 'Failed to create version')
      }
      const version = await versionRes.json()

      // 5. Handle file - either upload or external URL
      if (downloadType === 'upload' && modFile) {
        const fileFormData = new FormData()
        fileFormData.append('file', modFile)
        const fileUploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: fileFormData
        })
        
        if (!fileUploadRes.ok) throw new Error('Failed to upload file')
        const uploadedFile = await fileUploadRes.json()

        // Create file record with blob pathname
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version_id: version.id,
            filename: modFile.name,
            file_size: modFile.size,
            file_type: modFile.type || 'application/java-archive',
            blob_pathname: uploadedFile.pathname
          })
        })
      } else if (downloadType === 'link' && externalUrl) {
        // Create file record with external URL
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version_id: version.id,
            filename: title + (isResourcePack ? '.zip' : '.jar'),
            file_size: 0,
            file_type: isResourcePack ? 'application/zip' : 'application/java-archive',
            external_url: externalUrl
          })
        })
      }

      router.push(`/mods/${slug}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep2 = selectedVersions.length > 0 && (isResourcePack || selectedLoaders.length > 0)
  const canSubmit = downloadType === 'upload' ? !!modFile : !!externalUrl

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <button
                    onClick={() => s < step && setStep(s)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      transition-all duration-300 transform
                      ${step === s 
                        ? 'bg-primary text-primary-foreground scale-110' 
                        : step > s 
                          ? 'bg-primary/20 text-primary cursor-pointer hover:scale-105' 
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </button>
                  {s < 3 && (
                    <div className={`w-16 h-1 mx-2 rounded transition-colors duration-500 ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Create a New Project</h2>
                  <p className="text-muted-foreground">Start by providing basic information about your mod or resource pack.</p>
                </div>

                {/* Banner Upload */}
                <div>
                  <Label className="mb-2 block">Project Banner (Optional)</Label>
                  <label className="group cursor-pointer block">
                    <div className={`
                      w-full h-[160px] rounded-xl border-2 border-dashed
                      flex items-center justify-center overflow-hidden
                      transition-all duration-300 hover:border-primary hover:bg-primary/5
                      ${bannerPreview ? 'border-primary' : 'border-border'}
                    `}>
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                          <span className="text-sm text-muted-foreground">Upload a banner image (1200x400 recommended)</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  </label>
                </div>

                <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                  {/* Icon Upload */}
                  <div>
                    <Label className="mb-2 block">Project Icon</Label>
                    <label className="group cursor-pointer block">
                      <div className={`
                        w-[200px] h-[200px] rounded-xl border-2 border-dashed
                        flex items-center justify-center overflow-hidden
                        transition-all duration-300 hover:border-primary hover:bg-primary/5
                        ${iconPreview ? 'border-primary' : 'border-border'}
                      `}>
                        {iconPreview ? (
                          <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                            <span className="text-sm text-muted-foreground">Upload icon</span>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                    </label>
                  </div>

                  {/* Title & Category */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Awesome Mod"
                        className="mt-1.5 h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="mt-1.5 w-full h-12 px-3 rounded-md border border-input bg-background text-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="description">Short Description *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief description of your project..."
                        rows={3}
                        className="mt-1.5 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="body">Full Description</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a detailed description of your project. You can use Markdown for formatting..."
                    rows={8}
                    className="mt-1.5 font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!title || !description || !categoryId}
                    className="px-8 h-12 text-base transition-all duration-200 hover:scale-105"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Version & Compatibility */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Version & Compatibility</h2>
                  <p className="text-muted-foreground">Specify the version number and supported game versions{!isResourcePack && '/loaders'}.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="versionNumber">Version Number *</Label>
                    <Input
                      id="versionNumber"
                      value={versionNumber}
                      onChange={(e) => setVersionNumber(e.target.value)}
                      placeholder="1.0.0"
                      className="mt-1.5 h-12 font-mono transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <Label>Release Type</Label>
                    <div className="mt-1.5 flex gap-2">
                      {(['release', 'beta', 'alpha'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setReleaseType(type)}
                          className={`
                            flex-1 h-12 rounded-lg font-medium capitalize
                            transition-all duration-200 transform hover:scale-[1.02]
                            ${releaseType === type 
                              ? type === 'release' 
                                ? 'bg-green-500/20 text-green-400 border-2 border-green-500' 
                                : type === 'beta' 
                                  ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500'
                                  : 'bg-red-500/20 text-red-400 border-2 border-red-500'
                              : 'bg-muted text-muted-foreground border-2 border-transparent hover:border-border'
                            }
                          `}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Game Versions Selector */}
                <div>
                  <Label>Supported Minecraft Versions *</Label>
                  <div className="mt-1.5 relative">
                    <button
                      type="button"
                      onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                      className="w-full h-12 px-4 rounded-lg border border-input bg-background text-left flex items-center justify-between transition-all duration-200 hover:border-primary"
                    >
                      <span className={selectedVersions.length ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedVersions.length 
                          ? `${selectedVersions.length} version${selectedVersions.length > 1 ? 's' : ''} selected`
                          : 'Select game versions'
                        }
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showVersionDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showVersionDropdown && (
                      <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-popover border border-border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {gameVersions.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => toggleVersion(v.version)}
                            className={`
                              w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors
                              hover:bg-accent
                              ${selectedVersions.includes(v.version) ? 'bg-primary/10' : ''}
                            `}
                          >
                            <div className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                              ${selectedVersions.includes(v.version) 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground'
                              }
                            `}>
                              {selectedVersions.includes(v.version) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <span>{v.version}</span>
                            <span className="ml-auto text-xs text-muted-foreground capitalize">{v.version_type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedVersions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedVersions.map((v) => (
                        <span
                          key={v}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm animate-in fade-in zoom-in duration-200"
                        >
                          {v}
                          <button onClick={() => toggleVersion(v)} className="hover:text-primary/70">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mod Loaders Selector - only show if not resource pack */}
                {!isResourcePack && (
                  <div>
                    <Label>Supported Mod Loaders *</Label>
                    <div className="mt-1.5 relative">
                      <button
                        type="button"
                        onClick={() => setShowLoaderDropdown(!showLoaderDropdown)}
                        className="w-full h-12 px-4 rounded-lg border border-input bg-background text-left flex items-center justify-between transition-all duration-200 hover:border-primary"
                      >
                        <span className={selectedLoaders.length ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedLoaders.length 
                            ? `${selectedLoaders.length} loader${selectedLoaders.length > 1 ? 's' : ''} selected`
                            : 'Select mod loaders'
                          }
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showLoaderDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showLoaderDropdown && (
                        <div className="absolute z-20 mt-2 w-full bg-popover border border-border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                          {modLoaders.map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => toggleLoader(l.slug)}
                              className={`
                                w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors
                                hover:bg-accent
                                ${selectedLoaders.includes(l.slug) ? 'bg-primary/10' : ''}
                              `}
                            >
                              <div className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                ${selectedLoaders.includes(l.slug) 
                                  ? 'bg-primary border-primary' 
                                  : 'border-muted-foreground'
                                }
                              `}>
                                {selectedLoaders.includes(l.slug) && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <span>{l.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {selectedLoaders.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedLoaders.map((l) => (
                          <span
                            key={l}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm capitalize animate-in fade-in zoom-in duration-200"
                          >
                            {modLoaders.find(loader => loader.slug === l)?.name || l}
                            <button onClick={() => toggleLoader(l)} className="hover:text-accent-foreground/70">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isResourcePack && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-primary">Resource packs are compatible with all Minecraft clients - no mod loader required!</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="changelog">Changelog</Label>
                  <Textarea
                    id="changelog"
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="What's new in this version..."
                    rows={4}
                    className="mt-1.5 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="px-6 h-12 transition-all duration-200 hover:scale-105"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!canProceedStep2}
                    className="px-8 h-12 text-base transition-all duration-200 hover:scale-105"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: File Upload or External Link */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your File</h2>
                  <p className="text-muted-foreground">Upload your file directly or provide an external download link.</p>
                </div>

                {/* Download Type Toggle */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setDownloadType('upload')}
                    className={`
                      flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2
                      transition-all duration-300 transform hover:scale-[1.02]
                      ${downloadType === 'upload' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <Upload className={`w-8 h-8 ${downloadType === 'upload' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-medium ${downloadType === 'upload' ? 'text-primary' : 'text-foreground'}`}>
                      Upload File
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      Upload directly to our servers
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setDownloadType('link')}
                    className={`
                      flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2
                      transition-all duration-300 transform hover:scale-[1.02]
                      ${downloadType === 'link' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <LinkIcon className={`w-8 h-8 ${downloadType === 'link' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-medium ${downloadType === 'link' ? 'text-primary' : 'text-foreground'}`}>
                      External Link
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      Link to an external download
                    </span>
                  </button>
                </div>

                {downloadType === 'upload' ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-xl p-12 text-center
                      transition-all duration-300 transform
                      ${isDragging 
                        ? 'border-primary bg-primary/10 scale-[1.02]' 
                        : modFile 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    {modFile ? (
                      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <FileArchive className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{modFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(modFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setModFile(null)}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Drag and drop your file here</p>
                          <p className="text-sm text-muted-foreground">or click to browse</p>
                        </div>
                        <input
                          type="file"
                          accept=".jar,.zip"
                          onChange={(e) => setModFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="modFile"
                        />
                        <label htmlFor="modFile">
                          <Button variant="outline" className="cursor-pointer transition-all duration-200 hover:scale-105" asChild>
                            <span>Browse Files</span>
                          </Button>
                        </label>
                        <p className="text-xs text-muted-foreground">Supported formats: .jar, .zip</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="externalUrl">Download URL *</Label>
                      <Input
                        id="externalUrl"
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://example.com/mymod.jar"
                        className="mt-1.5 h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Enter a direct download link to your file (Mediafire, Google Drive, Dropbox, etc.)
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="px-6 h-12 transition-all duration-200 hover:scale-105"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canSubmit}
                    className="px-8 h-12 text-base transition-all duration-200 hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
