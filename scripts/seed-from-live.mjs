/**
 * Live Site → Supabase Seeder
 * Pulls all articles and projects from the live API and loads them into Supabase,
 * including downloading and re-hosting images in Supabase Storage.
 *
 * Usage: node scripts/seed-from-live.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

// ── Supabase ─────────────────────────────────────────────────────────────────

let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
let SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  const env = readFileSync(join(__dir, '../.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const [k, ...rest] = line.split('=')
    const v = rest.join('=').trim()
    if (k === 'NEXT_PUBLIC_SUPABASE_URL') SUPABASE_URL = v
    if (k === 'SUPABASE_SERVICE_ROLE_KEY') SUPABASE_KEY = v
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

const BASE = 'https://abatementandremediation.com'

async function apiPost(path, body = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json()
}

function slugify(text) {
  return (text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function stripHtml(html) {
  return (html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function excerpt(html, max = 220) {
  const plain = stripHtml(html)
  return plain.length > max ? plain.slice(0, max - 3) + '...' : plain || null
}

async function downloadImage(url) {
  if (!url) return null
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': HEADERS['User-Agent'] },
    })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const ext = contentType.split('/')[1]?.split(';')[0] ?? 'jpg'
    return { buffer, contentType, ext }
  } catch {
    return null
  }
}

async function uploadImage(url, folder) {
  if (!url) return null
  const img = await downloadImage(url)
  if (!img) return null

  const filename = url.split('/').pop()?.split('?')[0] ?? `image-${Date.now()}.jpg`
  const path = `${folder}/${filename}`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, img.buffer, {
      contentType: img.contentType,
      upsert: true,
    })

  if (error) {
    // Fall back to original URL if upload fails
    console.warn(`    ⚠ Image upload failed (${filename}): ${error.message} — using original URL`)
    return url
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

function log(emoji, msg) { console.log(`${emoji}  ${msg}`) }

// ── Ensure storage bucket exists ──────────────────────────────────────────────

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === 'media')
  if (!exists) {
    const { error } = await supabase.storage.createBucket('media', { public: true })
    if (error) throw new Error(`Could not create storage bucket: ${error.message}`)
    log('🪣', 'Created public "media" storage bucket')
  } else {
    log('🪣', 'Storage bucket "media" ready')
  }
}

// ── Seed articles ─────────────────────────────────────────────────────────────

async function seedArticles() {
  log('📝', 'Fetching articles from live site...')
  const data = await apiPost('/api/blog/list', { per_page: 200 })
  const blogs = Array.isArray(data.data) ? data.data : (data.data?.data ?? [])
  log('📝', `Found ${blogs.length} articles`)

  const slugCount = {}
  let inserted = 0, updated = 0

  for (const b of blogs) {
    process.stdout.write(`  → [${b.id}] ${b.title?.slice(0, 60)}...\r`)

    // Deduplicate slugs
    let slug = b.slug ?? slugify(b.title)
    slugCount[slug] = (slugCount[slug] ?? 0) + 1
    if (slugCount[slug] > 1) slug = `${slug}-${b.id}`

    // Upload featured image to Supabase Storage
    const imageUrl = b.image?.src ?? null
    const hostedImage = imageUrl ? await uploadImage(imageUrl, 'blogs') : null

    const record = {
      id:             b.id,
      title:          b.title ?? 'Untitled',
      slug,
      excerpt:        excerpt(b.description),
      content:        b.description ?? null,
      featured_image: hostedImage,
      status:         b.status ?? 1,
      published_at:   b.status === 1 ? (b.created_at ?? new Date().toISOString()) : null,
      created_at:     b.created_at ?? new Date().toISOString(),
      updated_at:     b.updated_at ?? new Date().toISOString(),
    }

    // Check if exists
    const { data: existing } = await supabase
      .from('blogs').select('id').eq('id', b.id).single()

    if (existing) {
      await supabase.from('blogs').update(record).eq('id', b.id)
      updated++
    } else {
      await supabase.from('blogs').insert(record)
      inserted++
    }
  }

  console.log(`                                                            `)
  log('✅', `Articles: ${inserted} inserted, ${updated} updated`)
}

// ── Seed projects ─────────────────────────────────────────────────────────────

async function seedProjects() {
  log('🏗️', 'Fetching projects from live site...')
  const data = await apiPost('/api/project/list', { per_page: 200 })
  const projects = Array.isArray(data.data) ? data.data : (data.data?.data ?? [])
  log('🏗️', `Found ${projects.length} projects`)

  let inserted = 0, updated = 0

  for (const p of projects) {
    process.stdout.write(`  → [${p.id}] ${p.title?.slice(0, 60)}...\r`)

    const imageUrl = p.image?.src ?? null
    const hostedImage = imageUrl ? await uploadImage(imageUrl, 'projects') : null

    const record = {
      id:             p.id,
      title:          p.title ?? 'Untitled',
      description:    p.description ?? null,
      featured_image: hostedImage,
      status:         p.status ?? 1,
      show_on_home:   p.is_show_on_home === 1,
      created_at:     p.created_at ?? new Date().toISOString(),
      updated_at:     p.updated_at ?? new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from('projects').select('id').eq('id', p.id).single()

    if (existing) {
      await supabase.from('projects').update(record).eq('id', p.id)
      updated++
    } else {
      await supabase.from('projects').insert(record)
      inserted++
    }
  }

  console.log(`                                                            `)
  log('✅', `Projects: ${inserted} inserted, ${updated} updated`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  Live Site → Supabase Content Seeder\n')
  console.log(`   Source:   ${BASE}`)
  console.log(`   Supabase: ${SUPABASE_URL}\n`)

  await ensureBucket()
  await seedArticles()
  await seedProjects()

  console.log('\n✨  Done! All content seeded into Supabase.\n')
}

main().catch(err => {
  console.error('\n❌', err.message)
  process.exit(1)
})
