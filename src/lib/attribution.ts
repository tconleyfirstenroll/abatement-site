'use client'

export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  landing_page?: string
  referrer?: string
}

const FIRST_TOUCH_KEY = 'par_ft'
const LAST_TOUCH_KEY = 'par_lt'
const TTL_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

function getUrlParams(): Attribution {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const attr: Attribution = {}
  const utm_source = params.get('utm_source')
  const utm_medium = params.get('utm_medium')
  const utm_campaign = params.get('utm_campaign')
  const utm_term = params.get('utm_term')
  const utm_content = params.get('utm_content')
  const gclid = params.get('gclid')

  if (utm_source) attr.utm_source = utm_source
  if (utm_medium) attr.utm_medium = utm_medium
  if (utm_campaign) attr.utm_campaign = utm_campaign
  if (utm_term) attr.utm_term = utm_term
  if (utm_content) attr.utm_content = utm_content
  if (gclid) attr.gclid = gclid
  attr.landing_page = window.location.href
  attr.referrer = document.referrer || undefined

  return attr
}

function readStored(key: string): Attribution | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, expires } = JSON.parse(raw)
    if (Date.now() > expires) {
      localStorage.removeItem(key)
      return null
    }
    return data as Attribution
  } catch {
    return null
  }
}

function writeStored(key: string, data: Attribution) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, expires: Date.now() + TTL_MS }))
  } catch {}
}

export function captureAttribution() {
  if (typeof window === 'undefined') return
  const current = getUrlParams()
  const hasUtmOrGclid = current.utm_source || current.gclid

  // Always update last touch if there are UTM/GCLID params
  if (hasUtmOrGclid) {
    writeStored(LAST_TOUCH_KEY, current)
  }

  // Only set first touch if not already stored
  if (!readStored(FIRST_TOUCH_KEY)) {
    writeStored(FIRST_TOUCH_KEY, current)
  }
}

export function getFirstTouch(): Attribution {
  return readStored(FIRST_TOUCH_KEY) ?? {}
}

export function getLastTouch(): Attribution {
  return readStored(LAST_TOUCH_KEY) ?? {}
}

export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile'
  return 'desktop'
}

export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Safari/')) return 'Safari'
  return 'Other'
}

export function buildLeadAttribution() {
  const ft = getFirstTouch()
  const lt = getLastTouch()
  return {
    ft_utm_source: ft.utm_source,
    ft_utm_medium: ft.utm_medium,
    ft_utm_campaign: ft.utm_campaign,
    ft_utm_term: ft.utm_term,
    ft_utm_content: ft.utm_content,
    ft_gclid: ft.gclid,
    ft_landing_page: ft.landing_page,
    ft_referrer: ft.referrer,
    lt_utm_source: lt.utm_source,
    lt_utm_medium: lt.utm_medium,
    lt_utm_campaign: lt.utm_campaign,
    lt_utm_term: lt.utm_term,
    lt_utm_content: lt.utm_content,
    lt_gclid: lt.gclid,
    lt_landing_page: lt.landing_page,
    lt_referrer: lt.referrer,
    device_type: getDeviceType(),
    browser: getBrowser(),
  }
}
