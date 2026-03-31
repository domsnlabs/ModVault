import { redirect } from 'next/navigation'

export default function ShadersPage() {
  redirect('/mods/browse?category=shaders')
}
