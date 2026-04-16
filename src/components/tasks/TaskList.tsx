'use client'

import { useState, useEffect, useCallback } from 'react'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { TaskFilters, type FilterState } from './TaskFilters'
import type { Task } from '@/types/task'
import { getTaskVisualStatus, getStatusSortOrder } from '@/lib/utils/task-status'
import toast from 'react-hot-toast'

interface TaskListProps {
  defaultType?: 'work' | 'personal'
  showFilters?: boolean
  showArchived?: boolean
  caseId?: string
  title?: string
}

export function TaskList({ defaultType, showFilters = true, showArchived = false, caseId, title }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    type: defaultType || '',
    priority: '',
    court: '',
    sort_by: 'due_date',
    sort_dir: 'asc',
  })

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', showArchived ? 'completed' : 'pending')
      if (filters.type) params.set('type', filters.type)
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.court) params.set('court', filters.court)
      if (caseId) params.set('case_id', caseId)
      params.set('sort_by', filters.sort_by)
      params.set('sort_dir', filters.sort_dir)

      const res = await fetch(`/api/tasks?${params}`)
      if (!res.ok) throw new Error('Failed to load tasks')
      const data: Task[] = await res.json()

      // Client-side sort by visual status for priority sort
      if (filters.sort_by === 'priority') {
        data.sort((a, b) => getStatusSortOrder(getTaskVisualStatus(a)) - getStatusSortOrder(getTaskVisualStatus(b)))
      }

      setTasks(data)
    } catch {
      toast.error('שגיאה בטעינת משימות')
    } finally {
      setLoading(false)
    }
  }, [filters, showArchived, caseId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    function onExternalTaskSaved(e: Event) {
      const saved = (e as CustomEvent<Task>).detail
      setTasks((prev) => {
        if (prev.some((t) => t.id === saved.id)) return prev
        if (!showArchived && saved.status === 'pending') return [saved, ...prev]
        return prev
      })
    }
    window.addEventListener('lawtask:task-saved', onExternalTaskSaved)
    return () => window.removeEventListener('lawtask:task-saved', onExternalTaskSaved)
  }, [showArchived])

  function handleTaskClick(task: Task) {
    setSelectedTask(task)
    setModalOpen(true)
  }

  function handleTaskSaved(saved: Task) {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        // Remove from active list if completed (and not showing archive)
        if (!showArchived && saved.status === 'completed') {
          next.splice(idx, 1)
        }
        return next
      }
      // New task
      if (!showArchived && saved.status === 'pending') {
        return [saved, ...prev]
      }
      return prev
    })
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {title && <h2 className="text-lg font-bold text-app-primary">{title}</h2>}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-app-card border border-app rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {title && <h2 className="text-lg font-bold text-app-primary mb-4">{title}</h2>}

      {showFilters && (
        <TaskFilters
          filters={filters}
          onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        />
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-app-secondary">{showArchived ? 'אין משימות מושלמות' : 'אין משימות פעילות'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
          ))}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTask(null) }}
        mode={selectedTask ? 'edit' : 'create'}
        task={selectedTask || undefined}
        defaultType={defaultType}
        onSaved={handleTaskSaved}
        onDeleted={handleTaskDeleted}
      />
    </div>
  )
}
