'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import type { Task, TaskUpdate } from '@/types/task'
import { formatDate, formatDateTime, parseDisplayDate } from '@/lib/utils/date'
import { PRIORITY_LABEL, ISRAELI_COURTS } from '@/lib/constants'
import { CaseCombobox } from '@/components/cases/CaseCombobox'
import { TaskUpdateThread } from './TaskUpdateThread'
import { getTaskVisualStatus, STATUS_BADGE_CLASS } from '@/lib/utils/task-status'

type Mode = 'create' | 'edit' | 'view'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  mode: Mode
  task?: Task
  defaultType?: 'work' | 'personal'
  onSaved?: (task: Task) => void
  onDeleted?: (taskId: string) => void
}

const defaultForm = {
  type: 'work' as 'work' | 'personal',
  title: '',
  notes: '',
  due_date: '',
  priority: 'normal' as 'urgent' | 'normal' | 'low',
  case_id: null as string | null,
  court: '',
}

export function TaskModal({ open, onClose, mode, task, defaultType, onSaved, onDeleted }: TaskModalProps) {
  const isCreating = mode === 'create'
  const [form, setForm] = useState({ ...defaultForm, type: defaultType || 'work' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [updates, setUpdates] = useState<TaskUpdate[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(false)

  // Load task data when editing/viewing
  useEffect(() => {
    if (!open) return
    if (task) {
      setForm({
        type: task.type,
        title: task.title,
        notes: task.notes || '',
        due_date: task.due_date ? formatDate(task.due_date) : '',
        priority: task.priority,
        case_id: task.case_id || null,
        court: task.court || '',
      })
      // Load updates
      setLoadingUpdates(true)
      fetch(`/api/tasks/${task.id}/updates`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setUpdates(data)
        })
        .catch(() => {})
        .finally(() => setLoadingUpdates(false))
    } else {
      setForm({ ...defaultForm, type: defaultType || 'work' })
      setUpdates([])
    }
    setShowCompleteForm(false)
    setCompletionNotes('')
  }, [open, task, defaultType])

  function handleClose() {
    onClose()
    setShowCompleteForm(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('נא להזין כותרת')
      return
    }

    const dueDate = form.due_date ? parseDisplayDate(form.due_date) : null
    if (form.due_date && !dueDate) {
      toast.error('פורמט תאריך לא תקין. נסה: 15.5.26')
      return
    }

    setSaving(true)
    const body = {
      type: form.type,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      due_date: dueDate,
      priority: form.priority,
      case_id: form.case_id || null,
      court: form.court.trim() || null,
    }

    try {
      const url = isCreating ? '/api/tasks' : `/api/tasks/${task!.id}`
      const method = isCreating ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        const msg = errData?.error
          ? typeof errData.error === 'string'
            ? errData.error
            : JSON.stringify(errData.error)
          : `שגיאה ${res.status}`
        throw new Error(msg)
      }
      const saved: Task = await res.json()
      toast.success(isCreating ? 'משימה נוצרה!' : 'משימה עודכנה!')
      onSaved?.(saved)
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    if (!confirm('למחוק את המשימה?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('משימה נמחקה')
      onDeleted?.(task.id)
      handleClose()
    } catch {
      toast.error('שגיאה במחיקה')
    } finally {
      setDeleting(false)
    }
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    if (!task) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completion_notes: completionNotes || null }),
      })
      if (!res.ok) throw new Error('Failed')
      const updated: Task = await res.json()
      toast.success('משימה הושלמה! ✅')
      onSaved?.(updated)
      handleClose()
    } catch {
      toast.error('שגיאה')
    } finally {
      setCompleting(false)
    }
  }

  async function handleReopen() {
    if (!task) return
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      const updated: Task = await res.json()
      toast.success('משימה נפתחה מחדש')
      onSaved?.(updated)
      handleClose()
    } catch {
      toast.error('שגיאה')
    }
  }

  const visualStatus = task ? getTaskVisualStatus(task) : null

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-50 bg-app-card rounded-2xl shadow-2xl border border-app max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-app sticky top-0 bg-app-card z-10">
            <Dialog.Title className="text-lg font-bold text-app-primary">
              {isCreating ? '➕ משימה חדשה' : task?.title || 'עריכת משימה'}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {task && visualStatus && (
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE_CLASS[visualStatus])}>
                  {task.status === 'completed' ? '✓ בוצע' : visualStatus === 'overdue' ? 'פגה תוקף' : visualStatus === 'urgent' ? 'דחוף' : visualStatus === 'warning' ? 'קרוב' : ''}
                </span>
              )}
              <Dialog.Close asChild>
                <button className="text-app-secondary hover:text-app-primary text-xl leading-none">✕</button>
              </Dialog.Close>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Completed task view */}
            {task?.status === 'completed' && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                  ✅ הושלם ב-{formatDateTime(task.completed_at)}
                </p>
                {task.completion_notes && (
                  <p className="text-sm text-green-700 dark:text-green-300">{task.completion_notes}</p>
                )}
                <button
                  onClick={handleReopen}
                  className="mt-2 text-xs text-action-blue hover:underline"
                >
                  פתח מחדש
                </button>
              </div>
            )}

            {/* Complete task form (nested) */}
            {showCompleteForm && task?.status === 'pending' && (
              <form onSubmit={handleComplete} className="bg-app-secondary rounded-xl p-4 border border-app space-y-3">
                <h4 className="text-sm font-semibold text-app-primary">סימון ביצוע</h4>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="הערות ביצוע (אופציונלי)..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-app bg-app-card text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-2 focus:ring-navy/30 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={completing}
                    className="flex-1 py-2 text-sm bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 transition-colors"
                  >
                    {completing ? 'שומר...' : '✅ אשר ביצוע'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompleteForm(false)}
                    className="px-4 py-2 text-sm border border-app rounded-lg hover:bg-app-secondary text-app-secondary transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2">
                {(['work', 'personal'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t, case_id: t === 'personal' ? null : f.case_id }))}
                    className={clsx(
                      'flex-1 py-2 text-sm rounded-xl border font-medium transition-colors',
                      form.type === t
                        ? 'bg-navy text-white border-navy'
                        : 'border-app text-app-secondary hover:bg-app-secondary'
                    )}
                  >
                    {t === 'work' ? '💼 עבודה' : '👤 אישי'}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-app-primary mb-1.5">כותרת *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="מה צריך לעשות?"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-app bg-app-secondary text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-app-primary mb-1.5">עדיפות</label>
                <div className="flex gap-2">
                  {(['urgent', 'normal', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, priority: p }))}
                      className={clsx(
                        'flex-1 py-2 text-xs rounded-xl border font-medium transition-colors',
                        form.priority === p
                          ? p === 'urgent'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : p === 'normal'
                              ? 'bg-navy text-white border-navy'
                              : 'bg-gray-400 text-white border-gray-400'
                          : 'border-app text-app-secondary hover:bg-app-secondary'
                      )}
                    >
                      {PRIORITY_LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-sm font-medium text-app-primary mb-1.5">תאריך יעד</label>
                <input
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  placeholder="15.5.26 / 2026-05-15"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-app bg-app-secondary text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                />
              </div>

              {/* Case (work only) */}
              {form.type === 'work' && (
                <div>
                  <label className="block text-sm font-medium text-app-primary mb-1.5">תיק</label>
                  <CaseCombobox
                    selectedCaseId={form.case_id}
                    onSelectCase={(id, caseData) => {
                      setForm((f) => ({
                        ...f,
                        case_id: id,
                        court: caseData?.court || f.court,
                      }))
                    }}
                    initialCourtValue={form.court}
                  />
                </div>
              )}

              {/* Court */}
              <div>
                <label className="block text-sm font-medium text-app-primary mb-1.5">
                  בית משפט {form.type === 'work' && form.case_id ? '(ממוזג מהתיק)' : ''}
                </label>
                <select
                  value={form.court}
                  onChange={(e) => setForm((f) => ({ ...f, court: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-app bg-app-secondary text-app-primary focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                >
                  <option value="">בחר בית משפט</option>
                  {ISRAELI_COURTS.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-app-primary mb-1.5">הערות</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="הערות נוספות..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-app bg-app-secondary text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-2 focus:ring-navy/30 resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm bg-navy text-white rounded-xl font-medium hover:bg-navy/90 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'שומר...' : isCreating ? 'צור משימה' : 'שמור שינויים'}
                </button>

                {task?.status === 'pending' && !showCompleteForm && (
                  <button
                    type="button"
                    onClick={() => setShowCompleteForm(true)}
                    className="px-4 py-2.5 text-sm bg-success text-white rounded-xl font-medium hover:bg-success/90 transition-colors"
                  >
                    ✅ בצע
                  </button>
                )}

                {task && !isCreating && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2.5 text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? '...' : '🗑️'}
                  </button>
                )}
              </div>
            </form>

            {/* Updates log */}
            {task && (
              <>
                <div className="border-t border-app pt-4">
                  {loadingUpdates ? (
                    <p className="text-xs text-app-secondary">טוען עדכונים...</p>
                  ) : (
                    <TaskUpdateThread
                      taskId={task.id}
                      updates={updates}
                      onUpdateAdded={(u) => setUpdates((prev) => [...prev, u])}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
