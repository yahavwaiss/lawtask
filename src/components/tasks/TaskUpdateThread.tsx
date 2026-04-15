'use client'

import { useState } from 'react'
import { formatDateTime } from '@/lib/utils/date'
import toast from 'react-hot-toast'
import type { TaskUpdate } from '@/types/task'

interface TaskUpdateThreadProps {
  taskId: string
  updates: TaskUpdate[]
  onUpdateAdded: (update: TaskUpdate) => void
}

export function TaskUpdateThread({ taskId, updates, onUpdateAdded }: TaskUpdateThreadProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)

    try {
      const res = await fetch(`/api/tasks/${taskId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const update = await res.json()
      onUpdateAdded(update)
      setContent('')
      toast.success('עדכון נוסף')
    } catch {
      toast.error('שגיאה בהוספת עדכון')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-app-primary mb-3">📝 לוג עדכונים</h4>

      {updates.length === 0 ? (
        <p className="text-xs text-app-secondary mb-3">אין עדכונים עדיין</p>
      ) : (
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {updates.map((u) => (
            <div key={u.id} className="bg-app-secondary rounded-lg p-3">
              <p className="text-xs text-app-secondary mb-1">{formatDateTime(u.created_at)}</p>
              <p className="text-sm text-app-primary whitespace-pre-wrap">{u.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddUpdate} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="הוסף עדכון..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-app bg-app-secondary text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 text-sm bg-navy text-white rounded-lg hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : 'הוסף'}
        </button>
      </form>
    </div>
  )
}
