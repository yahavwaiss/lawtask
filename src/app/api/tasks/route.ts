import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTaskSchema } from '@/lib/validations/task'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // work | personal | null (all)
  const status = searchParams.get('status') || 'pending' // pending | completed | all
  const priority = searchParams.get('priority')
  const court = searchParams.get('court')
  const caseId = searchParams.get('case_id')
  const sortBy = searchParams.get('sort_by') || 'due_date'
  const sortDir = searchParams.get('sort_dir') || 'asc'

  let query = supabase
    .from('tasks')
    .select('*, cases(id, case_number, case_name, court)')
    .eq('user_id', user.id)

  if (status !== 'all') {
    query = query.eq('status', status)
  }
  if (type) query = query.eq('type', type)
  if (priority) query = query.eq('priority', priority)
  if (court) query = query.eq('court', court)
  if (caseId) query = query.eq('case_id', caseId)

  const ascending = sortDir === 'asc'
  if (sortBy === 'due_date') {
    // Tasks with a due_date sorted first (ascending), then tasks without due_date sorted by newest first
    query = query
      .order('due_date', { ascending, nullsFirst: false })
      .order('created_at', { ascending: false })
  } else if (sortBy === 'priority') {
    // We sort in JS after fetching for priority order
    query = query.order('created_at', { ascending: false })
  } else if (sortBy === 'created_at') {
    query = query.order('created_at', { ascending })
  } else if (sortBy === 'title') {
    query = query.order('title', { ascending })
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, user_id: user.id })
    .select('*, cases(id, case_number, case_name, court)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
