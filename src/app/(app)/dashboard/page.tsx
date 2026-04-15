import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch stats server-side for fast initial load
  const today = new Date().toISOString().split('T')[0]
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [overdueRes, warningRes, weekRes, completedRes, urgentRes, casesRes] = await Promise.all([
    // Overdue
    supabase.from('tasks').select('id', { count: 'exact' })
      .eq('user_id', user.id).eq('status', 'pending').lt('due_date', today),
    // Warning (due in ≤3 days, not yet overdue)
    supabase.from('tasks').select('id', { count: 'exact' })
      .eq('user_id', user.id).eq('status', 'pending').gte('due_date', today).lte('due_date', in3Days),
    // This week
    supabase.from('tasks').select('id', { count: 'exact' })
      .eq('user_id', user.id).eq('status', 'pending').gte('due_date', today).lte('due_date', in7Days),
    // Completed this month
    supabase.from('tasks').select('id', { count: 'exact' })
      .eq('user_id', user.id).eq('status', 'completed').gte('completed_at', startOfMonth),
    // Urgent pending tasks
    supabase.from('tasks')
      .select('*, cases(id, case_number, case_name, court)')
      .eq('user_id', user.id).eq('status', 'pending').eq('priority', 'urgent')
      .order('due_date', { ascending: true, nullsFirst: false }).limit(5),
    // Active cases
    supabase.from('cases').select('*, tasks!left(id, status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
  ])

  return (
    <DashboardClient
      stats={{
        overdue: overdueRes.count ?? 0,
        warning: warningRes.count ?? 0,
        week: weekRes.count ?? 0,
        completedMonth: completedRes.count ?? 0,
      }}
      urgentTasks={(urgentRes.data ?? []) as never}
      cases={(casesRes.data ?? []) as never}
    />
  )
}
