import { createServiceClient } from '@/lib/supabase/server'
import { getBot } from '@/lib/telegram/bot'
import { formatDate } from '@/lib/utils/date'
import { PRIORITY_LABEL } from '@/lib/constants'

export async function runDailyCron() {
  const supabase = createServiceClient()
  const bot = getBot()

  const today = new Date().toISOString().split('T')[0]
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get all users with telegram linked
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, telegram_chat_id')
    .not('telegram_chat_id', 'is', null)

  if (!profiles) return

  for (const profile of profiles) {
    if (!profile.telegram_chat_id) continue

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, priority, due_date, type, cases(case_name)')
      .eq('user_id', profile.id)
      .eq('status', 'pending')
      .or(`due_date.lt.${today},and(due_date.gte.${today},due_date.lte.${in3Days})`)
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(10)

    if (!tasks || tasks.length === 0) continue

    const overdue = tasks.filter((t) => t.due_date && t.due_date < today)
    const dueToday = tasks.filter((t) => t.due_date === today)
    const dueSoon = tasks.filter((t) => t.due_date && t.due_date > today && t.due_date <= in3Days)

    const lines: string[] = ['☀️ *בוקר טוב! סיכום יומי:*\n']

    if (overdue.length > 0) {
      lines.push(`🔴 *פגות תוקף (${overdue.length}):*`)
      overdue.forEach((t) => {
        lines.push(`• ${t.title} | ${formatDate(t.due_date)}`)
      })
      lines.push('')
    }

    if (dueToday.length > 0) {
      lines.push(`📌 *היום (${dueToday.length}):*`)
      dueToday.forEach((t) => {
        lines.push(`• ${t.title} [${PRIORITY_LABEL[t.priority] ?? t.priority}]`)
      })
      lines.push('')
    }

    if (dueSoon.length > 0) {
      lines.push(`🟡 *עד 3 ימים (${dueSoon.length}):*`)
      dueSoon.forEach((t) => {
        lines.push(`• ${t.title} | ${formatDate(t.due_date)}`)
      })
    }

    try {
      await bot.sendMessage(profile.telegram_chat_id, lines.join('\n'), { parse_mode: 'Markdown' })
    } catch (err) {
      console.error(`Failed to send daily digest to ${profile.telegram_chat_id}:`, err)
    }
  }
}
