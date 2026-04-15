import { createServiceClient } from '@/lib/supabase/server'

export interface SessionState {
  step: 'idle' | 'awaiting_confirmation' | 'awaiting_edit_field'
  pendingTask?: {
    type: 'work' | 'personal'
    title: string
    notes: string | null
    due_date: string | null
    priority: 'urgent' | 'normal' | 'low'
    court: string | null
    case_id: string | null
    case_name: string | null
  }
  editField?: string
}

export async function getSession(chatId: string): Promise<SessionState> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('telegram_sessions')
    .select('state')
    .eq('chat_id', chatId)
    .single()

  return (data?.state as SessionState) ?? { step: 'idle' }
}

export async function setSession(chatId: string, state: SessionState, userId?: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase
    .from('telegram_sessions')
    .upsert({
      chat_id: chatId,
      state: state as never,
      user_id: userId ?? null,
      updated_at: new Date().toISOString(),
    })
}

export async function getUserIdByChatId(chatId: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_chat_id', chatId)
    .single()
  return data?.id ?? null
}
