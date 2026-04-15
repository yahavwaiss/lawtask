import { differenceInCalendarDays, parseISO } from 'date-fns'

export type TaskVisualStatus = 'overdue' | 'urgent' | 'warning' | 'normal' | 'completed'

export interface TaskForStatus {
  status: 'pending' | 'completed'
  priority: 'urgent' | 'normal' | 'low'
  due_date: string | null
}

export function getTaskVisualStatus(task: TaskForStatus): TaskVisualStatus {
  if (task.status === 'completed') return 'completed'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (task.due_date) {
    const due = parseISO(task.due_date)
    const diff = differenceInCalendarDays(due, today)
    if (diff < 0) return 'overdue'
    if (diff <= 3) return 'warning'
  }

  if (task.priority === 'urgent') return 'urgent'

  return 'normal'
}

export function getStatusSortOrder(status: TaskVisualStatus): number {
  const order: Record<TaskVisualStatus, number> = {
    overdue: 0,
    urgent: 1,
    warning: 2,
    normal: 3,
    completed: 4,
  }
  return order[status]
}

export const STATUS_BORDER_COLOR: Record<TaskVisualStatus, string> = {
  overdue: 'border-r-overdue',
  urgent: 'border-r-urgent',
  warning: 'border-r-warning',
  normal: 'border-r-gray-300 dark:border-r-gray-600',
  completed: 'border-r-success',
}

export const STATUS_BADGE_CLASS: Record<TaskVisualStatus, string> = {
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  urgent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  normal: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export const STATUS_LABEL: Record<TaskVisualStatus, string> = {
  overdue: 'פגה תוקף',
  urgent: 'דחוף',
  warning: 'קרוב',
  normal: 'רגיל',
  completed: 'בוצע',
}
