#!/usr/bin/env node
// scripts/fix-priority-constraint.mjs
// Fixes the tasks_priority_check constraint in Supabase.
// Requires a personal access token from https://supabase.com/dashboard/account/tokens
// Usage: SUPABASE_ACCESS_TOKEN=<token> node scripts/fix-priority-constraint.mjs

import { readFileSync } from 'fs'

// Parse .env.local so the script works without manual env setup
try {
  const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.+)$/)
    if (match) process.env[match[1]] ??= match[2].trim()
  }
} catch { /* .env.local not found — rely on shell env */ }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
const token = process.env.SUPABASE_ACCESS_TOKEN

if (!ref) {
  console.error('❌ Could not read Supabase project ref from NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}
if (!token) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN\n')
  console.error('1. Go to https://supabase.com/dashboard/account/tokens')
  console.error('2. Create a new token')
  console.error('3. Run: SUPABASE_ACCESS_TOKEN=<token> node scripts/fix-priority-constraint.mjs')
  process.exit(1)
}

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
  return res.json()
}

console.log(`\nFixing priority constraint on project: ${ref}\n`)

try {
  await sql(`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check`)
  console.log('  ✓ Dropped old constraint')

  await sql(`ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('urgent', 'normal', 'low'))`)
  console.log('  ✓ Created correct constraint (urgent | normal | low)')

  const fixed = await sql(
    `UPDATE tasks SET priority = 'normal' WHERE priority NOT IN ('urgent', 'normal', 'low') RETURNING id`
  )
  if (Array.isArray(fixed) && fixed.length > 0) {
    console.log(`  ✓ Migrated ${fixed.length} task(s) with invalid priority → 'normal'`)
  }

  console.log('\n✅ Done! You can now create tasks normally.\n')
} catch (err) {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
}
