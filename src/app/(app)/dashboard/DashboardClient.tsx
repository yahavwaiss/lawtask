'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import Link from 'next/link'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskModal } from '@/components/tasks/TaskModal'
import type { Task } from '@/types/task'

interface Stats {
  overdue: number
  warning: number
  week: number
  completedMonth: number
}

interface CaseWithCount {
  id: string
  case_number: string
  case_name: string
  court: string | null
  tasks?: { id: string; status: string }[]
}

interface DashboardClientProps {
  stats: Stats
  urgentTasks: Task[]
  cases: CaseWithCount[]
  userName?: string
}

const statCards = (stats: Stats) => [
  {
    label: 'פגו תוקף',
    value: stats.overdue,
    href: '/tasks',
    valueClass: 'text-overdue',
    bgClass: 'bg-overdue/5 border-r-[3px] border-overdue/40',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-overdue/70">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    label: 'עד 3 ימים',
    value: stats.warning,
    href: '/tasks',
    valueClass: 'text-warning',
    bgClass: 'bg-warning/5 border-r-[3px] border-warning/40',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-warning/70">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: 'השבוע',
    value: stats.week,
    href: '/tasks',
    valueClass: 'text-ink',
    bgClass: 'bg-gold/5 border-r-[3px] border-gold/40',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gold/70">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'הושלמו החודש',
    value: stats.completedMonth,
    href: '/archive',
    valueClass: 'text-success',
    bgClass: 'bg-success/5 border-r-[3px] border-success/40',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-success/70">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
]

export function DashboardClient({ stats, urgentTasks, cases, userName }: DashboardClientProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const router = useRouter()
  const cards = statCards(stats)

  useEffect(() => {
    function onTaskSaved() { router.refresh() }
    window.addEventListener('lawtask:task-saved', onTaskSaved)
    return () => window.removeEventListener('lawtask:task-saved', onTaskSaved)
  }, [router])

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold/60 mb-1">לוח בקרה</p>
          <h1 className="text-2xl font-headline font-bold text-app-primary leading-tight">
            שלום, עורך דין{userName ? ` ${userName}` : ''}
          </h1>
          <p className="text-app-secondary text-sm mt-1">סיכום המשימות שלך להיום</p>
        </div>
        <Link
          href="/tasks"
          className="hidden md:flex items-center gap-1.5 text-xs text-gold/70 hover:text-gold transition-colors font-medium"
        >
          כל המשימות
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 rotate-180">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={clsx(
              'bg-app-card rounded-xl p-5 transition-all duration-200 hover:shadow-legal group',
              card.bgClass
            )}
          >
            <div className="flex items-start justify-between mb-3">
              {card.icon}
            </div>
            <div className={clsx('text-3xl font-headline font-bold tabular-nums mb-0.5', card.valueClass)}>
              {card.value}
            </div>
            <div className="text-xs text-app-secondary">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-overdue/60 mb-0.5">דורשות טיפול</p>
              <h2 className="text-lg font-headline font-bold text-app-primary">משימות דחופות</h2>
            </div>
            <Link href="/tasks" className="text-xs text-gold/70 hover:text-gold transition-colors font-medium flex items-center gap-1">
              הצג הכל
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rotate-180">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
          <div className="space-y-2">
            {urgentTasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
            ))}
          </div>
        </div>
      )}

      {/* Active Cases */}
      {cases.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold/50 mb-0.5">בטיפול</p>
              <h2 className="text-lg font-headline font-bold text-app-primary">תיקים פעילים</h2>
            </div>
            <Link href="/cases" className="text-xs text-gold/70 hover:text-gold transition-colors font-medium flex items-center gap-1">
              הצג הכל
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rotate-180">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cases.map((c) => {
              const openCount = c.tasks?.filter((t) => t.status !== 'completed').length ?? 0
              const doneCount = c.tasks?.filter((t) => t.status === 'completed').length ?? 0
              return (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="bg-app-card rounded-xl p-5 hover:shadow-legal transition-all duration-200 group border-r-[3px] border-gold/20 hover:border-gold/50"
                >
                  <h3 className="font-semibold text-app-primary text-sm mb-1 group-hover:text-gold transition-colors">{c.case_name}</h3>
                  <p className="text-xs text-app-secondary mb-3 font-mono">{c.case_number}</p>
                  {c.court && <p className="text-xs text-app-secondary mb-3 flex items-center gap-1">⚖️ {c.court}</p>}
                  <div className="flex gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-gold/10 text-gold font-semibold tracking-wide">
                      {openCount} פתוחות
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-success/10 text-success font-semibold tracking-wide">
                      {doneCount} בוצעו
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {urgentTasks.length === 0 && cases.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold/5 border border-gold/10 mb-6">
            <span className="text-4xl">⚖️</span>
          </div>
          <h2 className="text-xl font-headline font-bold text-app-primary mb-2">ברוך הבא ל-LawTask!</h2>
          <p className="text-app-secondary mb-2">התחל בהוספת המשימה הראשונה שלך</p>
          <p className="text-sm text-app-secondary/50">לחץ <kbd className="px-1.5 py-0.5 rounded bg-app-card text-gold border border-gold/20 text-xs font-mono">N</kbd> ליצירת משימה</p>
        </div>
      )}

      <TaskModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        mode="edit"
        task={selectedTask || undefined}
        onSaved={() => setSelectedTask(null)}
        onDeleted={() => setSelectedTask(null)}
      />
    </div>
  )
}
