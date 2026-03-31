export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Mod {
  id: string
  user_id: string
  title: string
  slug: string
  description: string
  body: string | null
  category_id: string | null
  icon_url: string | null
  header_url: string | null
  downloads_count: number
  follows_count: number
  status: 'active' | 'archived' | 'hidden'
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
  categories?: Category
  mod_versions?: ModVersion[]
  reviews?: Review[]
}

export interface ModVersion {
  id: string
  mod_id: string
  version_number: string
  changelog: string | null
  status: 'release' | 'beta' | 'alpha'
  created_at: string
  // Joined fields
  mod_files?: ModFile[]
}

export interface ModFile {
  id: string
  version_id: string
  filename: string
  file_size: number | null
  file_type: string | null
  blob_pathname: string | null
  downloads_count: number
  created_at: string
}

export interface Comment {
  id: string
  mod_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
}

export interface Review {
  id: string
  mod_id: string
  user_id: string
  rating: number
  body: string | null
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
}

export interface Favorite {
  id: string
  mod_id: string
  user_id: string
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  title: string
  description: string | null
  slug: string | null
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Profile
  collection_items?: CollectionItem[]
}

export interface CollectionItem {
  id: string
  collection_id: string
  mod_id: string
  order_index: number | null
  created_at: string
  // Joined fields
  mods?: Mod
}

export type SortOption = 'downloads' | 'newest' | 'updated' | 'follows'

export interface SearchFilters {
  query?: string
  category?: string
  sort?: SortOption
  page?: number
}
