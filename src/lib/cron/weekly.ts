import { createServiceClient } from '@/lib/supabase/server'
import { getBot } from '@/lib/telegram/bot'
import { formatDate } from '@/lib/utils/date'

export async function runWeeklyCron() {
  const supabase = createServiceClient()
  const bot = getBot()

  const today = new Date().toISOString().split('T')[0]
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, telegram_chat_id')
    .not('telegram_chat_id', 'is', null)

  if (!profiles) return

  for (const profile of profiles) {
    if (!profile.telegram_chat_id) continue

    const [openRes, completedRes, weekRes] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', profile.id).eq('status', 'pending'),
      supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', profile.id).eq('status', 'completed').gte('completed_at', startOfWeek),
      supabase
        .from('tasks')
        .select('id, title, due_date, priority')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .gte('due_date', today)
        .lte('due_date', in7Days)
        .order('due_date', { ascending: true })
        .limit(8),
    ])

    const lines: string[] = [
      '📊 *סיכום שבועי — LawTask*\n',
      `✅ הושלמו השבוע: ${completedRes.count ?? 0}`,
      `📋 משימות פתוחות: ${openRes.count ?? 0}`,
    ]

    if (weekRes.data && weekRes.data.length > 0) {
      lines.push('\n📅 *צפי לשבוע הקרוב:*')
      weekRes.data.forEach((t) => {
        lines.push(`• ${t.title} | ${formatDate(t.due_date)}`)
      })
    }

    lines.push('\nבהצלחה בשבוע! ⚖️')

    try {
      await bot.sendMessage(profile.telegram_chat_id, lines.join('\n'), { parse_mode: 'Markdown' })
    } catch (err) {
      console.error(`Failed to send weekly summary to ${profile.telegram_chat_id}:`, err)
    }
  }
}
