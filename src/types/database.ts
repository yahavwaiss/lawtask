export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string
          user_id: string
          case_number: string
          case_name: string
          court: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          case_number: string
          case_name: string
          court?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          case_number?: string
          case_name?: string
          court?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          type: 'work' | 'personal'
          title: string
          notes: string | null
          due_date: string | null
          priority: 'urgent' | 'normal' | 'low'
          case_id: string | null
          court: string | null
          status: 'pending' | 'completed'
          completed_at: string | null
          completion_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'work' | 'personal'
          title: string
          notes?: string | null
          due_date?: string | null
          priority?: 'urgent' | 'normal' | 'low'
          case_id?: string | null
          court?: string | null
          status?: 'pending' | 'completed'
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'work' | 'personal'
          title?: string
          notes?: string | null
          due_date?: string | null
          priority?: 'urgent' | 'normal' | 'low'
          case_id?: string | null
          court?: string | null
          status?: 'pending' | 'completed'
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
        }
      }
      task_updates: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          telegram_chat_id: string | null
          telegram_link_code: string | null
          telegram_link_code_expires_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          telegram_chat_id?: string | null
          telegram_link_code?: string | null
          telegram_link_code_expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          telegram_chat_id?: string | null
          telegram_link_code?: string | null
          telegram_link_code_expires_at?: string | null
          created_at?: string
        }
      }
      telegram_sessions: {
        Row: {
          chat_id: string
          user_id: string | null
          state: Record<string, unknown> | null
          updated_at: string
        }
        Insert: {
          chat_id: string
          user_id?: string | null
          state?: Record<string, unknown> | null
          updated_at?: string
        }
        Update: {
          chat_id?: string
          user_id?: string | null
          state?: Record<string, unknown> | null
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
