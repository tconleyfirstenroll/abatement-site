/**
 * MySQL → Supabase Migration Script
 * Priority Abatement & Remediation
 *
 * Usage:
 *   node scripts/migrate.mjs
 *
 * Before running, set the MySQL credentials below (or pass as env vars):
 *   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *
 * The script migrates in order:
 *   1. categories
 *   2. blogs (articles)
 *   3. projects
 *   4. leads
 *   5. zipcodes
 *
 * It is safe to run multiple times — existing records are upserted by id.
 */

import mysql from 'mysql2/promise'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Config ────────────────────────────────────────────────────────────────────

const MYSQL = {
  host:     process.env.MYSQL_HOST     ?? '127.0.0.1',
  port:     parseInt(process.env.MYSQL_PORT ?? '3306'),
  user:     process.env.MYSQL_USER     ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'laravel',
}

// Load from .env.local if running locally
const __dir = dirname(fileURLToPath(import.meta.url))
let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
let SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  try {
    const env = readFileSync(join(__dir, '../.env.local'), 'utf8')
    for (const line of env.split('\n')) {
      const [k, ...rest] = line.split('=')
      const v = rest.join('=').trim()
      if (k === 'NEXT_PUBLIC_SUPABASE_URL') SUPABASE_URL = v
      if (k === 'SUPABASE_SERVICE_ROLE_KEY') SUPABASE_KEY = v
    }
  } catch {}
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text) {
  if (!text) return `item-${Date.now()}`
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function mediaUrl(src, path) {
  // Old app stored images under /storage or /assets/images
  if (!src) return null
  if (src.startsWith('http')) return src
  // Try to build a reasonable public URL from the legacy storage path
  const base = 'https://abatementandremediation.com'
  if (path && path.includes('assets')) return `${base}/${src}`
  return `${base}/storage/${src}`
}

async function upsert(table, rows, onConflict = 'id') {
  if (!rows.length) return { count: 0 }
  const CHUNK = 100
  let total = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await supabase.from(table).upsert(chunk, { onConflict })
    if (error) throw new Error(`${table}: ${error.message}`)
    total += chunk.length
  }
  return { count: total }
}

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`)
}

// ── Migration steps ───────────────────────────────────────────────────────────

async function migrateCategories(db) {
  log('📂', 'Migrating categories...')
  const [rows] = await db.query('SELECT * FROM categories')

  // Build slug map to deduplicate
  const slugCount = {}
  const mapped = rows.map(row => {
    let slug = slugify(row.name)
    slugCount[slug] = (slugCount[slug] ?? 0) + 1
    if (slugCount[slug] > 1) slug = `${slug}-${row.id}`
    return {
      id:         row.id,
      name:       row.name,
      slug,
      status:     row.status ?? 1,
      parent_id:  row.parent_id > 0 ? row.parent_id : null,
      type:       row.type ?? null,
      sort_order: 0,
      deleted_at: row.deleted_at ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  })

  // Insert parents first, then children
  const parents  = mapped.filter(r => !r.parent_id)
  const children = mapped.filter(r =>  r.parent_id)

  const r1 = await upsert('categories', parents)
  const r2 = await upsert('categories', children)
  log('✅', `Categories: ${r1.count + r2.count} records migrated`)
}

async function migrateBlogs(db) {
  log('📝', 'Migrating blogs/articles...')
  const [blogs] = await db.query('SELECT * FROM blogs')
  const [media] = await db.query("SELECT * FROM media WHERE mediable_type = 'App\\\\Models\\\\Blog'")

  const mediaByBlog = {}
  for (const m of media) {
    if (!mediaByBlog[m.mediable_id]) mediaByBlog[m.mediable_id] = m
  }

  const slugCount = {}
  const mapped = blogs.map(row => {
    let slug = row.slug ?? slugify(row.title)
    slugCount[slug] = (slugCount[slug] ?? 0) + 1
    if (slugCount[slug] > 1) slug = `${slug}-${row.id}`

    const m = mediaByBlog[row.id]
    const featuredImage = m ? mediaUrl(m.src, m.path) : null

    // Strip raw HTML tags for excerpt — take first 200 chars of plain text
    const plainText = (row.description ?? '').replace(/<[^>]*>/g, '').trim()
    const excerpt = plainText.length > 200 ? plainText.slice(0, 197) + '...' : plainText || null

    return {
      id:               row.id,
      title:            row.title ?? 'Untitled',
      slug,
      excerpt,
      content:          row.description ?? null,
      featured_image:   featuredImage,
      status:           row.status ?? 0,
      deleted_at:       row.deleted_at ?? null,
      published_at:     row.status === 1 ? (row.created_at ?? new Date().toISOString()) : null,
      created_at:       row.created_at,
      updated_at:       row.updated_at,
    }
  })

  const { count } = await upsert('blogs', mapped)
  log('✅', `Blogs: ${count} records migrated`)
}

async function migrateProjects(db) {
  log('🏗️', 'Migrating projects...')
  const [projects] = await db.query('SELECT * FROM projects')
  const [media]    = await db.query("SELECT * FROM media WHERE mediable_type = 'App\\\\Models\\\\Project'")

  const mediaByProject = {}
  for (const m of media) {
    if (!mediaByProject[m.mediable_id]) mediaByProject[m.mediable_id] = m
  }

  const mapped = projects.map(row => {
    const m = mediaByProject[row.id]
    return {
      id:             row.id,
      title:          row.title,
      description:    row.description ?? null,
      featured_image: m ? mediaUrl(m.src, m.path) : null,
      status:         row.status ?? 1,
      show_on_home:   row.is_show_on_home === 1,
      deleted_at:     row.deleted_at ?? null,
      created_at:     row.created_at,
      updated_at:     row.updated_at,
    }
  })

  const { count } = await upsert('projects', mapped)
  log('✅', `Projects: ${count} records migrated`)
}

async function migrateLeads(db) {
  log('📞', 'Migrating leads...')
  const [rows] = await db.query('SELECT * FROM leads')

  const mapped = rows.map(row => {
    // Old app stored all fields in a JSON `data` column
    const d = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data ?? {})

    return {
      id:                 row.id,
      first_name:         d.first_name ?? null,
      last_name:          d.last_name ?? null,
      email:              d.email ?? null,
      phone:              d.phone ?? null,
      project_type:       d.project_type ?? null,
      category_name:      d.category_name ?? null,
      category_type:      d.category_type ?? null,
      material_contain:   Array.isArray(d.material_contain) ? d.material_contain : [],
      is_material_tested: d.is_material_tested ?? null,
      work_done:          d.work_done ?? null,
      details:            d.details ?? null,
      street:             d.street ?? null,
      zip_code:           d.zip_code ?? null,
      city:               d.city ?? null,
      state:              d.state ?? null,
      start_date:         d.start_date || null,
      start_time:         d.start_time ?? null,
      sms_opt_in:         false,
      status:             row.status ?? 'new',
      // No attribution data in old leads — leave nulls
      raw_data:           d,
      deleted_at:         row.deleted_at ?? null,
      created_at:         row.created_at,
      updated_at:         row.updated_at,
    }
  })

  const { count } = await upsert('leads', mapped)
  log('✅', `Leads: ${count} records migrated`)
}

async function migrateZipcodes(db) {
  log('📮', 'Migrating zipcodes...')

  // Check if the zipcodes table exists in MySQL
  const [tables] = await db.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'zipcodes'",
    [MYSQL.database]
  )

  if (!tables.length) {
    log('⚠️', 'No zipcodes table found in MySQL — skipping')
    return
  }

  const [rows] = await db.query('SELECT * FROM zipcodes LIMIT 50000')
  const mapped = rows.map(row => ({
    zip:     String(row.zip).padStart(5, '0'),
    city:    row.city,
    state:   row.state,
    country: row.country ?? 'US',
  }))

  const { count } = await upsert('zipcodes', mapped, 'zip')
  log('✅', `Zipcodes: ${count} records migrated`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  Priority Abatement & Remediation — MySQL → Supabase Migration\n')
  console.log(`   MySQL:    ${MYSQL.user}@${MYSQL.host}:${MYSQL.port}/${MYSQL.database}`)
  console.log(`   Supabase: ${SUPABASE_URL}\n`)

  let db
  try {
    db = await mysql.createConnection(MYSQL)
    log('🔌', 'Connected to MySQL')
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message)
    console.error('\n   Set credentials via environment variables:')
    console.error('   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE\n')
    process.exit(1)
  }

  try {
    await migrateCategories(db)
    await migrateBlogs(db)
    await migrateProjects(db)
    await migrateLeads(db)
    await migrateZipcodes(db)
    console.log('\n✨  Migration complete!\n')
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message)
    process.exit(1)
  } finally {
    await db.end()
  }
}

main()
