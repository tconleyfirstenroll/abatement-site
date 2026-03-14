'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost', 'spam']

const statusStyles: Record<string, string> = {
  new: 'bg-green-50 border-green-200 text-green-700',
  contacted: 'bg-blue-50 border-blue-200 text-blue-700',
  in_progress: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  won: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  lost: 'bg-red-50 border-red-200 text-red-700',
  spam: 'bg-gray-100 border-gray-200 text-gray-500',
}

interface Props {
  leadId: number
  currentStatus: string
}

export function LeadStatusUpdater({ leadId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function updateStatus(newStatus: string) {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
      setStatus(newStatus)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => updateStatus(s)}
          disabled={saving}
          className={cn(
            'w-full rounded-xl border px-4 py-2.5 text-left text-sm font-semibold capitalize transition-all',
            status === s
              ? statusStyles[s]
              : 'border-border bg-white text-muted hover:border-brand/40 hover:text-black'
          )}
        >
          {s.replace('_', ' ')}
          {status === s && ' ✓'}
        </button>
      ))}
    </div>
  )
}
