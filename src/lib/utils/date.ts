import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { he } from 'date-fns/locale'

/** Display format: DD.MM.YY */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  try {
    return format(parseISO(isoDate), 'dd.MM.yy')
  } catch {
    return isoDate
  }
}

/** Format datetime with time */
export function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  try {
    return format(parseISO(isoDate), 'dd.MM.yy HH:mm', { locale: he })
  } catch {
    return isoDate
  }
}

/** Days until due date (negative = overdue) */
export function daysUntil(isoDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return differenceInCalendarDays(parseISO(isoDate), today)
}

export function isOverdue(isoDate: string): boolean {
  return daysUntil(isoDate) < 0
}

/** Parse DD.MM.YY or DD.MM.YYYY or YYYY-MM-DD */
export function parseDisplayDate(input: string): string | null {
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input

  // DD.MM.YY or DD.MM.YYYY
  const match = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
  if (!match) return null

  const [, d, m, yRaw] = match
  const year = yRaw.length === 2 ? `20${yRaw}` : yRaw
  const month = m.padStart(2, '0')
  const day = d.padStart(2, '0')

  const iso = `${year}-${month}-${day}`
  // Validate
  const date = new Date(iso)
  if (isNaN(date.getTime())) return null
  return iso
}
