import Link from 'next/link'
import { Search } from 'lucide-react'

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full flex-col bg-secondary/40">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Campus Lost &amp; Found
          </span>
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
