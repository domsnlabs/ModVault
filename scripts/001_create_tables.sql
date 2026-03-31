-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mods table (for both mods and resource packs)
CREATE TABLE IF NOT EXISTS public.mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('mod', 'resourcepack', 'shader', 'datapack', 'modpack')),
  client_side TEXT DEFAULT 'required' CHECK (client_side IN ('required', 'optional', 'unsupported')),
  server_side TEXT DEFAULT 'required' CHECK (server_side IN ('required', 'optional', 'unsupported')),
  downloads INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unlisted', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mod categories (many-to-many)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('mod', 'resourcepack', 'shader', 'datapack', 'modpack'))
);

CREATE TABLE IF NOT EXISTS public.mod_categories (
  mod_id UUID REFERENCES public.mods(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (mod_id, category_id)
);

-- Mod versions
CREATE TABLE IF NOT EXISTS public.mod_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  name TEXT NOT NULL,
  changelog TEXT,
  release_type TEXT DEFAULT 'release' CHECK (release_type IN ('release', 'beta', 'alpha')),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game versions supported by mod versions
CREATE TABLE IF NOT EXISTS public.game_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT UNIQUE NOT NULL,
  version_type TEXT DEFAULT 'release' CHECK (version_type IN ('release', 'snapshot')),
  release_date DATE
);

CREATE TABLE IF NOT EXISTS public.mod_version_game_versions (
  mod_version_id UUID REFERENCES public.mod_versions(id) ON DELETE CASCADE,
  game_version_id UUID REFERENCES public.game_versions(id) ON DELETE CASCADE,
  PRIMARY KEY (mod_version_id, game_version_id)
);

-- Loaders supported by mod versions
CREATE TABLE IF NOT EXISTS public.loaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.mod_version_loaders (
  mod_version_id UUID REFERENCES public.mod_versions(id) ON DELETE CASCADE,
  loader_id UUID REFERENCES public.loaders(id) ON DELETE CASCADE,
  PRIMARY KEY (mod_version_id, loader_id)
);

-- Mod files (stored in Vercel Blob)
CREATE TABLE IF NOT EXISTS public.mod_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_version_id UUID NOT NULL REFERENCES public.mod_versions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  blob_pathname TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images
CREATE TABLE IF NOT EXISTS public.mod_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  ordering INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mod_id UUID REFERENCES public.mods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, mod_id)
);

-- Ratings/Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mod_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections/Modpacks
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.collection_mods (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  mod_id UUID REFERENCES public.mods(id) ON DELETE CASCADE,
  ordering INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, mod_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mods_user_id ON public.mods(user_id);
CREATE INDEX IF NOT EXISTS idx_mods_slug ON public.mods(slug);
CREATE INDEX IF NOT EXISTS idx_mods_project_type ON public.mods(project_type);
CREATE INDEX IF NOT EXISTS idx_mods_status ON public.mods(status);
CREATE INDEX IF NOT EXISTS idx_mod_versions_mod_id ON public.mod_versions(mod_id);
CREATE INDEX IF NOT EXISTS idx_mod_files_mod_version_id ON public.mod_files(mod_version_id);
CREATE INDEX IF NOT EXISTS idx_comments_mod_id ON public.comments(mod_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mod_id ON public.reviews(mod_id);
CREATE INDEX IF NOT EXISTS idx_favorites_mod_id ON public.favorites(mod_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
