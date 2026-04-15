import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ tasks: [], cases: [] })
  }

  const [tasksRes, casesRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, type, status, due_date, priority, case_id')
      .eq('user_id', user.id)
      .ilike('title', `%${q}%`)
      .limit(6),
    supabase
      .from('cases')
      .select('id, case_number, case_name, court')
      .eq('user_id', user.id)
      .or(`case_number.ilike.%${q}%,case_name.ilike.%${q}%`)
      .limit(4),
  ])

  return NextResponse.json({
    tasks: tasksRes.data ?? [],
    cases: casesRes.data ?? [],
  })
}
