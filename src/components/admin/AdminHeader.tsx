'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Props {
  user: { email: string; name: string }
}

export function AdminHeader({ user }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
      <div />
      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-black transition-colors"
        >
          <ExternalLink size={14} />
          View Site
        </Link>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-black text-black">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-black">{user.name}</span>
        </div>
      </div>
    </header>
  )
}
