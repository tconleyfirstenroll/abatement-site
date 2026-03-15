'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Tag,
  Settings,
  PhoneIncoming,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, adminOnly: false },
  { label: 'Leads', href: '/admin/leads', icon: PhoneIncoming, adminOnly: false },
  { label: 'Articles', href: '/admin/articles', icon: FileText, adminOnly: false },
  { label: 'Projects', href: '/admin/projects', icon: Briefcase, adminOnly: false },
  { label: 'Categories', href: '/admin/categories', icon: Tag, adminOnly: false },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
]

interface Props {
  role: string
}

export function AdminSidebar({ role }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isAdmin = role === 'admin'

  return (
    <aside className="flex h-full w-64 flex-col bg-black text-white">
      {/* Logo */}
      <div className="flex flex-col gap-1 p-6 border-b border-white/10">
        <Image
          src="/brand/admin-logo.png"
          alt="Priority Abatement & Remediation"
          width={160}
          height={48}
          className="h-10 w-auto brightness-0 invert"
        />
        <div className="text-xs text-white/40 mt-1">Admin Panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand text-black'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </Link>
            )
          })}
      </nav>

      {/* Role badge + sign out */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-3 flex items-center gap-2 px-3">
          <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand">
            {role}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
