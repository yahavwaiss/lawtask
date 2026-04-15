import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

// POST: Generate a link code
export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const code = randomBytes(6).toString('hex').toUpperCase() // e.g. A3F9C2
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

  const serviceSupabase = createServiceClient()
  const { error } = await serviceSupabase
    .from('profiles')
    .upsert({
      id: user.id,
      telegram_link_code: code,
      telegram_link_code_expires_at: expiresAt,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ code, expiresAt })
}

// DELETE: Unlink Telegram
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()
  const { error } = await serviceSupabase
    .from('profiles')
    .update({ telegram_chat_id: null, telegram_link_code: null, telegram_link_code_expires_at: null })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// GET: Check current link status
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceSupabase = createServiceClient()
  const { data } = await serviceSupabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ linked: !!data?.telegram_chat_id })
}
