import Link from 'next/link'
import { Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ModVault</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop destination for Minecraft mods, resource packs, shaders, and more.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mods" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mods
                </Link>
              </li>
              <li>
                <Link href="/resource-packs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Resource Packs
                </Link>
              </li>
              <li>
                <Link href="/shaders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Shaders
                </Link>
              </li>
              <li>
                <Link href="/modpacks" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Modpacks
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/collections" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/creators" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Creators
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Content Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ModVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
