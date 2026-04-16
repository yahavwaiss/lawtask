'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskModal } from '@/components/tasks/TaskModal'
import type { Task } from '@/types/task'
import { formatDate } from '@/lib/utils/date'
import toast from 'react-hot-toast'

interface CaseDetail {
  id: string
  case_number: string
  case_name: string
  court: string | null
  created_at: string
  tasks?: Task[]
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error('תיק לא נמצא')
          router.push('/cases')
        } else {
          setCaseData(data)
        }
      })
      .catch(() => toast.error('שגיאה בטעינת תיק'))
      .finally(() => setLoading(false))
  }, [id, router])

  useEffect(() => {
    function onExternalTaskSaved(e: Event) {
      const task = (e as CustomEvent).detail as Task
      if (task.case_id !== id) return
      setCaseData((prev) => {
        if (!prev) return prev
        if ((prev.tasks ?? []).some((t) => t.id === task.id)) return prev
        return { ...prev, tasks: [task, ...(prev.tasks ?? [])] }
      })
    }
    window.addEventListener('lawtask:task-saved', onExternalTaskSaved)
    return () => window.removeEventListener('lawtask:task-saved', onExternalTaskSaved)
  }, [id])

  async function handleExportPdf() {
    setExportingPdf(true)
    try {
      const res = await fetch(`/api/cases/${id}/pdf`)
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `case-${caseData?.case_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF יוצא בהצלחה')
    } catch {
      toast.error('שגיאה בייצוא PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  function handleTaskSaved(saved: Task) {
    setCaseData((prev) => {
      if (!prev) return prev
      const tasks = prev.tasks ?? []
      const idx = tasks.findIndex((t) => t.id === saved.id)
      if (idx >= 0) {
        const next = [...tasks]
        next[idx] = saved
        return { ...prev, tasks: next }
      }
      return { ...prev, tasks: [saved, ...tasks] }
    })
  }

  function handleTaskDeleted(taskId: string) {
    setCaseData((prev) => {
      if (!prev) return prev
      return { ...prev, tasks: (prev.tasks ?? []).filter((t) => t.id !== taskId) }
    })
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-app-card rounded w-48" />
        <div className="h-20 bg-app-card rounded" />
      </div>
    )
  }

  if (!caseData) return null

  const activeTasks = caseData.tasks?.filter((t) => t.status === 'pending') ?? []
  const completedTasks = caseData.tasks?.filter((t) => t.status === 'completed') ?? []
  const displayedTasks = activeTab === 'active' ? activeTasks : completedTasks

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-app-secondary hover:text-app-primary mb-3 flex items-center gap-1"
        >
          ← חזרה לתיקים
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-app-primary">{caseData.case_name}</h1>
            <p className="text-app-secondary text-sm mt-1">
              {caseData.case_number}
              {caseData.court && ` · ${caseData.court}`}
            </p>
            <p className="text-xs text-app-secondary mt-0.5">
              נוצר: {formatDate(caseData.created_at)}
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="shrink-0 px-4 py-2 text-sm border border-app rounded-xl text-app-secondary hover:bg-app-secondary transition-colors disabled:opacity-50"
          >
            {exportingPdf ? 'מייצא...' : '📄 ייצוא PDF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-app mb-5 gap-1">
        {([['active', 'פעילות', activeTasks.length], ['completed', 'הושלמו', completedTasks.length]] as const).map(
          ([tab, label, count]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-navy text-navy dark:text-blue-300 dark:border-blue-300'
                  : 'border-transparent text-app-secondary hover:text-app-primary'
              )}
            >
              {label} ({count})
            </button>
          )
        )}
      </div>

      {/* Tasks */}
      {displayedTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-app-secondary text-sm">
            {activeTab === 'active' ? 'אין משימות פעילות בתיק זה' : 'אין משימות מושלמות עדיין'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        mode="edit"
        task={selectedTask || undefined}
        onSaved={handleTaskSaved}
        onDeleted={handleTaskDeleted}
      />
    </div>
  )
}
