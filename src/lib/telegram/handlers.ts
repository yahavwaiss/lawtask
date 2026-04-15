import { getBot } from './bot'
import { parseTaskFromMessage } from './gemini'
import { getSession, setSession, getUserIdByChatId } from './session'
import { createServiceClient } from '@/lib/supabase/server'
import type { Case } from '@/types/task'
import { formatDate } from '@/lib/utils/date'
import { PRIORITY_LABEL } from '@/lib/constants'

const bot = () => getBot()

function formatTaskPreview(task: {
  title: string
  due_date: string | null
  priority: string
  case_name: string | null
  notes: string | null
  type: string
}): string {
  const lines = [
    '📋 *פרטי המשימה שזיהיתי:*',
    `כותרת: ${task.title}`,
    `סוג: ${task.type === 'work' ? 'עבודה' : 'אישי'}`,
    `עדיפות: ${PRIORITY_LABEL[task.priority] ?? task.priority}`,
  ]
  if (task.due_date) lines.push(`תאריך: ${formatDate(task.due_date)}`)
  if (task.case_name) lines.push(`תיק: ${task.case_name}`)
  if (task.notes) lines.push(`הערות: ${task.notes}`)
  return lines.join('\n')
}

export async function handleTelegramUpdate(update: {
  message?: {
    chat: { id: number }
    from?: { id: number }
    text?: string
  }
  callback_query?: {
    id: string
    data: string
    from: { id: number }
    message: {
      chat: { id: number }
      message_id: number
    }
  }
}) {
  const supabase = createServiceClient()

  // Handle callback query (button press)
  if (update.callback_query) {
    const { id: queryId, data, from, message } = update.callback_query
    const chatId = message.chat.id.toString()
    const userId = await getUserIdByChatId(chatId)

    await bot().answerCallbackQuery(queryId)

    if (!userId) {
      await bot().sendMessage(chatId, 'לא נמצא חשבון מקושר. אנא קשר את חשבון הטלגרם שלך בהגדרות.')
      return
    }

    const session = await getSession(chatId)

    if (data === 'confirm' && session.step === 'awaiting_confirmation' && session.pendingTask) {
      // Save task
      const taskData = {
        ...session.pendingTask,
        user_id: userId,
        status: 'pending' as const,
      }
      const { error } = await supabase.from('tasks').insert(taskData)
      if (error) {
        await bot().sendMessage(chatId, '❌ שגיאה בשמירת המשימה. נסה שנית.')
      } else {
        await bot().sendMessage(chatId, `✅ המשימה "${session.pendingTask.title}" נשמרה בהצלחה!`)
        await setSession(chatId, { step: 'idle' }, userId)
      }
    } else if (data === 'cancel') {
      await setSession(chatId, { step: 'idle' }, userId)
      await bot().sendMessage(chatId, '❌ בוטל. שלח הודעה חדשה להוספת משימה.')
    } else if (data.startsWith('edit:') && session.step === 'awaiting_confirmation') {
      const field = data.replace('edit:', '')
      const fieldLabels: Record<string, string> = {
        title: 'כותרת',
        due_date: 'תאריך יעד (פורמט: YYYY-MM-DD)',
        priority: 'עדיפות (urgent/normal/low)',
        notes: 'הערות',
      }
      await setSession(chatId, { ...session, step: 'awaiting_edit_field', editField: field }, userId)
      await bot().sendMessage(chatId, `✏️ שלח את הערך החדש עבור: ${fieldLabels[field] ?? field}`)
    }

    // Handle editing
    if (data === 'edit' && session.step === 'awaiting_confirmation') {
      await bot().sendMessage(
        chatId,
        'מה לערוך?',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📝 כותרת', callback_data: 'edit:title' }, { text: '📅 תאריך', callback_data: 'edit:due_date' }],
              [{ text: '⚡ עדיפות', callback_data: 'edit:priority' }, { text: '📋 הערות', callback_data: 'edit:notes' }],
            ],
          },
        }
      )
    }
    return
  }

  // Handle text message
  if (!update.message?.text) return

  const chatId = update.message.chat.id.toString()
  const text = update.message.text
  const userId = await getUserIdByChatId(chatId)
  const session = await getSession(chatId)

  // /start or /help command
  if (text === '/start' || text === '/help') {
    await bot().sendMessage(
      chatId,
      userId
        ? '👋 שלום! שלח לי הודעה חופשית ואוסיף לך משימה. לדוגמה: "להגיש ערר עד ה-15.5"'
        : '👋 שלום! אנא קשר את חשבון הטלגרם שלך תחילה בהגדרות של LawTask.'
    )
    return
  }

  // /link command for account linking
  if (text.startsWith('/link ')) {
    const code = text.replace('/link ', '').trim()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, telegram_link_code, telegram_link_code_expires_at')
      .eq('telegram_link_code', code)
      .single()

    if (error || !profile) {
      await bot().sendMessage(chatId, '❌ קוד לא נמצא או פג תוקף. צור קוד חדש בהגדרות.')
      return
    }

    const expiresAt = new Date(profile.telegram_link_code_expires_at ?? 0)
    if (expiresAt < new Date()) {
      await bot().sendMessage(chatId, '❌ הקוד פג תוקף. צור קוד חדש בהגדרות.')
      return
    }

    await supabase
      .from('profiles')
      .update({
        telegram_chat_id: chatId,
        telegram_link_code: null,
        telegram_link_code_expires_at: null,
      })
      .eq('id', profile.id)

    await setSession(chatId, { step: 'idle' }, profile.id)
    await bot().sendMessage(chatId, '✅ חשבון הטלגרם שלך קושר בהצלחה! כעת תוכל לשלוח משימות.')
    return
  }

  if (!userId) {
    await bot().sendMessage(chatId, '⚠️ לא נמצא חשבון מקושר. אנא קשר את חשבון הטלגרם שלך בהגדרות של LawTask.')
    return
  }

  // Handle edit field input
  if (session.step === 'awaiting_edit_field' && session.pendingTask && session.editField) {
    const updated = { ...session.pendingTask }
    const field = session.editField as keyof typeof updated
    if (field in updated) {
      (updated as Record<string, unknown>)[field] = text
    }
    await setSession(chatId, { step: 'awaiting_confirmation', pendingTask: updated }, userId)

    const preview = formatTaskPreview(updated)
    await bot().sendMessage(chatId, preview, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ אשר', callback_data: 'confirm' },
            { text: '✏️ ערוך', callback_data: 'edit' },
            { text: '❌ בטל', callback_data: 'cancel' },
          ],
        ],
      },
    })
    return
  }

  // Parse new task from message
  try {
    await bot().sendMessage(chatId, '🔍 מנתח את ההודעה...')

    // Fetch user's cases for context
    const { data: casesData } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', userId)

    const cases: Case[] = casesData ?? []
    const parsed = await parseTaskFromMessage(text, cases)

    // Match case by name
    let caseId: string | null = null
    if (parsed.case_name) {
      const match = cases.find(
        (c) =>
          c.case_name.toLowerCase().includes(parsed.case_name!.toLowerCase()) ||
          parsed.case_name!.toLowerCase().includes(c.case_name.toLowerCase())
      )
      caseId = match?.id ?? null
    }

    const pendingTask = {
      type: parsed.type,
      title: parsed.title,
      notes: parsed.notes,
      due_date: parsed.due_date,
      priority: parsed.priority,
      court: parsed.court,
      case_id: caseId,
      case_name: caseId ? cases.find((c) => c.id === caseId)?.case_name ?? parsed.case_name : parsed.case_name,
    }

    await setSession(chatId, { step: 'awaiting_confirmation', pendingTask }, userId)

    const preview = formatTaskPreview(pendingTask)
    await bot().sendMessage(chatId, preview, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ אשר', callback_data: 'confirm' },
            { text: '✏️ ערוך', callback_data: 'edit' },
            { text: '❌ בטל', callback_data: 'cancel' },
          ],
        ],
      },
    })
  } catch (err) {
    console.error('Telegram handler error:', err)
    await bot().sendMessage(chatId, '❌ שגיאה בניתוח ההודעה. נסה לנסח אחרת.')
    await setSession(chatId, { step: 'idle' }, userId)
  }
}
