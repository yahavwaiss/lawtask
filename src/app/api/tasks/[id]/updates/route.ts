import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateUpdateSchema } from '@/lib/validations/task'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify task belongs to user
  const { error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (taskError) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('task_updates')
    .select('*')
    .eq('task_id', params.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify task belongs to user
  const { error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (taskError) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('task_updates')
    .insert({
      task_id: params.id,
      user_id: user.id,
      content: parsed.data.content,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
