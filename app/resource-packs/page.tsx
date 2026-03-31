import { redirect } from 'next/navigation'

export default function ResourcePacksPage() {
  redirect('/mods/browse?category=resource-packs')
}
