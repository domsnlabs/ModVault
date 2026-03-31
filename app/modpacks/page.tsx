import { redirect } from 'next/navigation'

export default function ModpacksPage() {
  redirect('/mods/browse?category=modpacks')
}
