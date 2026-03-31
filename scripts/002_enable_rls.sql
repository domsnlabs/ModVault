-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_version_game_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_version_loaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_mods ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Mods policies
CREATE POLICY "mods_select_published" ON public.mods FOR SELECT USING (status = 'published' OR user_id = auth.uid());
CREATE POLICY "mods_insert_own" ON public.mods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mods_update_own" ON public.mods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mods_delete_own" ON public.mods FOR DELETE USING (auth.uid() = user_id);

-- Categories policies (read-only for users, admin managed)
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- Mod categories policies
CREATE POLICY "mod_categories_select_all" ON public.mod_categories FOR SELECT USING (true);
CREATE POLICY "mod_categories_insert_own" ON public.mod_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);
CREATE POLICY "mod_categories_delete_own" ON public.mod_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);

-- Mod versions policies
CREATE POLICY "mod_versions_select_all" ON public.mod_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND (status = 'published' OR user_id = auth.uid()))
);
CREATE POLICY "mod_versions_insert_own" ON public.mod_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);
CREATE POLICY "mod_versions_update_own" ON public.mod_versions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);
CREATE POLICY "mod_versions_delete_own" ON public.mod_versions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);

-- Game versions policies (read-only)
CREATE POLICY "game_versions_select_all" ON public.game_versions FOR SELECT USING (true);

-- Mod version game versions policies
CREATE POLICY "mod_version_game_versions_select_all" ON public.mod_version_game_versions FOR SELECT USING (true);
CREATE POLICY "mod_version_game_versions_insert_own" ON public.mod_version_game_versions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mod_versions mv 
    JOIN public.mods m ON mv.mod_id = m.id 
    WHERE mv.id = mod_version_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "mod_version_game_versions_delete_own" ON public.mod_version_game_versions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.mod_versions mv 
    JOIN public.mods m ON mv.mod_id = m.id 
    WHERE mv.id = mod_version_id AND m.user_id = auth.uid()
  )
);

-- Loaders policies (read-only)
CREATE POLICY "loaders_select_all" ON public.loaders FOR SELECT USING (true);

-- Mod version loaders policies
CREATE POLICY "mod_version_loaders_select_all" ON public.mod_version_loaders FOR SELECT USING (true);
CREATE POLICY "mod_version_loaders_insert_own" ON public.mod_version_loaders FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mod_versions mv 
    JOIN public.mods m ON mv.mod_id = m.id 
    WHERE mv.id = mod_version_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "mod_version_loaders_delete_own" ON public.mod_version_loaders FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.mod_versions mv 
    JOIN public.mods m ON mv.mod_id = m.id 
    WHERE mv.id = mod_version_id AND m.user_id = auth.uid()
  )
);

-- Mod files policies
CREATE POLICY "mod_files_select_all" ON public.mod_files FOR SELECT USING (true);
CREATE POLICY "mod_files_insert_own" ON public.mod_files FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mod_versions mv 
    JOIN public.mods m ON mv.mod_id = m.id 
    WHERE mv.id = mod_version_id AND m.user_id = auth.uid()
  )
);
CREATE POLICY "mod_files_delete_own" ON public.mod_files FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.mod_versions mv 
    JOIN public.mods m ON mv.mod_id = m.id 
    WHERE mv.id = mod_version_id AND m.user_id = auth.uid()
  )
);

-- Gallery policies
CREATE POLICY "mod_gallery_select_all" ON public.mod_gallery FOR SELECT USING (true);
CREATE POLICY "mod_gallery_insert_own" ON public.mod_gallery FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);
CREATE POLICY "mod_gallery_update_own" ON public.mod_gallery FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);
CREATE POLICY "mod_gallery_delete_own" ON public.mod_gallery FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.mods WHERE id = mod_id AND user_id = auth.uid())
);

-- Favorites policies
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Collections policies
CREATE POLICY "collections_select_public" ON public.collections FOR SELECT USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "collections_insert_own" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "collections_delete_own" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Collection mods policies
CREATE POLICY "collection_mods_select_public" ON public.collection_mods FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND (is_public = true OR user_id = auth.uid()))
);
CREATE POLICY "collection_mods_insert_own" ON public.collection_mods FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);
CREATE POLICY "collection_mods_delete_own" ON public.collection_mods FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);
