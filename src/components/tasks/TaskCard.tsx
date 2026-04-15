'use client'

import { clsx } from 'clsx'
import type { Task } from '@/types/task'
import { getTaskVisualStatus } from '@/lib/utils/task-status'
import { formatDate, daysUntil } from '@/lib/utils/date'
import { PRIORITY_LABEL } from '@/lib/constants'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

// Right-side colored strip (RTL: right = visual start)
const STATUS_STRIP_COLOR: Record<string, string> = {
  overdue:   'bg-[#ba1a1a]',
  urgent:    'bg-orange-500',
  warning:   'bg-[#fcb87d]',
  normal:    'bg-[#acc7ff]',
  completed: 'bg-emerald-500',
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  overdue:   { bg: 'bg-[#ffdad6]/80 dark:bg-red-900/30 border border-[#ba1a1a]/20 dark:border-red-700/30',  text: 'text-[#93000a] dark:text-red-400',    label: 'דחוף ביותר' },
  urgent:    { bg: 'bg-orange-100/80 dark:bg-orange-900/20 border border-orange-400/20',                    text: 'text-orange-700 dark:text-orange-400', label: 'בטיפול' },
  warning:   { bg: 'bg-[#ffdcc1]/80 dark:bg-yellow-900/20 border border-[#fcb87d]/30',                      text: 'text-[#693c0a] dark:text-yellow-400',  label: 'בקרוב' },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-400/20',                    text: 'text-emerald-700 dark:text-emerald-400', label: '✓ בוצע' },
}

const PRIORITY_PILL: Record<string, string> = {
  urgent: 'bg-[#ffdad6]/60 text-[#93000a] dark:bg-red-900/30 dark:text-red-300 border border-[#ba1a1a]/20 dark:border-red-700/30',
  low:    'bg-[#edeeef] dark:bg-[#334155] text-[#44474f] dark:text-[#94a3b8] border border-[#c4c6d0]/30 dark:border-[#334155]',
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const visualStatus = getTaskVisualStatus(task)
  const stripColor = STATUS_STRIP_COLOR[visualStatus] ?? STATUS_STRIP_COLOR.normal
  const badge = STATUS_BADGE[visualStatus]

  const dueDays = task.due_date ? daysUntil(task.due_date) : null
  const dueDateLabel = task.due_date
    ? dueDays !== null && dueDays < 0
      ? `איחור ${Math.abs(dueDays)} ימים`
      : dueDays === 0 ? 'היום!'
      : dueDays === 1 ? 'מחר'
      : `${dueDays} ימים`
    : null

  return (
    <button
      onClick={() => onClick(task)}
      className={clsx(
        'w-full text-right rounded-xl overflow-hidden transition-all duration-150 group relative',
        'bg-white dark:bg-[#1e293b]',
        'shadow-[0_1px_3px_rgba(0,36,82,0.05)] dark:shadow-none',
        'hover:shadow-[0_12px_32px_-4px_rgba(0,36,82,0.08)] dark:hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.3)]',
        'border border-[#c4c6d0]/10 dark:border-[#334155]',
        'dark:hover:border-[#334155]',
        'active:scale-[0.99]',
      )}
    >
      {/* Status strip — right side (RTL visual start) */}
      <div className={clsx('absolute right-0 top-0 bottom-0 w-1.5', stripColor)} />

      <div className="p-5 pr-6">
        {/* Top row: badge + time */}
        <div className="flex justify-between items-start mb-3">
          {badge ? (
            <span className={clsx(
              'text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider',
              badge.bg, badge.text
            )}>
              {badge.label}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#dbe1ff]/60 text-[#003ea8] dark:bg-blue-900/20 dark:text-blue-400 border border-[#acc7ff]/30">
              {PRIORITY_LABEL[task.priority] || 'רגיל'}
            </span>
          )}

          {task.due_date && (
            <span className={clsx(
              'text-xs font-medium flex items-center gap-1',
              visualStatus === 'overdue' ? 'text-[#ba1a1a] dark:text-red-400' :
              visualStatus === 'urgent'  ? 'text-orange-600 dark:text-orange-400' :
              'text-[#747780] dark:text-[#94a3b8]'
            )}>
              <span className="material-symbols-outlined text-sm leading-none">schedule</span>
              {dueDateLabel || formatDate(task.due_date)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={clsx(
          'text-base font-bold text-[#002452] dark:text-[#f8fafc] leading-snug mb-2',
          'group-hover:text-[#0051d5] dark:group-hover:text-sky-400 transition-colors',
          task.status === 'completed' && 'line-through opacity-50'
        )}>
          {task.title}
        </h3>

        {/* Notes preview */}
        {task.notes && (
          <p className="text-xs text-[#44474f] dark:text-[#94a3b8] line-clamp-2 mb-3 leading-relaxed">
            {task.notes}
          </p>
        )}

        {/* Bottom row: case tag + court */}
        <div className="flex items-center gap-2 flex-wrap">
          {task.cases && (
            <span className="inline-flex items-center gap-1 bg-[#d7e2ff] dark:bg-[#334155] text-[#001a40] dark:text-[#f8fafc] px-2 py-1 rounded text-xs font-semibold">
              <span className="material-symbols-outlined text-sm leading-none">briefcase_meal</span>
              {task.cases.case_number || task.cases.case_name}
            </span>
          )}
          {task.court && !task.cases?.court && (
            <span className="inline-flex items-center gap-1 text-xs text-[#44474f] dark:text-[#94a3b8]">
              <span className="material-symbols-outlined text-sm leading-none">account_balance</span>
              {task.court}
            </span>
          )}
          {task.type === 'personal' && (
            <span className="inline-flex items-center gap-1 bg-[#dbe1ff]/60 dark:bg-blue-900/20 text-[#003ea8] dark:text-blue-400 px-2 py-1 rounded text-xs font-semibold border border-[#acc7ff]/30">
              <span className="material-symbols-outlined text-sm leading-none">person</span>
              אישי
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
