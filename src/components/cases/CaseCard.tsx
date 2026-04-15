'use client'

import Link from 'next/link'
import { clsx } from 'clsx'

interface CaseCardProps {
  id: string
  case_number: string
  case_name: string
  court: string | null
  openCount: number
  completedCount: number
  onDelete: () => void
}

export function CaseCard({ id, case_number, case_name, court, openCount, completedCount, onDelete }: CaseCardProps) {
  return (
    <div className="bg-surface-container-lowest dark:bg-dark-card rounded-xl p-6 shadow-legal-sm hover:shadow-legal-md dark:shadow-none transition-all group border border-outline-variant/10 dark:border-dark-border hover:border-outline-variant/30 dark:hover:border-dark-border cursor-pointer relative">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/cases/${id}`} className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-lg text-primary dark:text-dark-text group-hover:text-secondary dark:group-hover:text-dark-blue transition-colors leading-tight">
            {case_name}
          </h3>
          <p className="text-xs text-outline dark:text-dark-muted font-mono mt-1">{case_number}</p>
          {court && (
            <p className="text-sm text-on-surface-variant dark:text-dark-muted mt-1.5 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 shrink-0">
                <path d="M3 22V12m0 0l9-9 9 9M3 12h18"/>
              </svg>
              {court}
            </p>
          )}
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href={`/cases/${id}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant dark:text-dark-muted hover:text-secondary dark:hover:text-dark-blue hover:bg-surface-container dark:hover:bg-dark-border transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant dark:text-dark-muted hover:text-error dark:hover:text-red-400 hover:bg-error-container/20 dark:hover:bg-red-900/20 transition-colors"
            title="מחק תיק"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className={clsx(
          'text-xs px-3 py-1 rounded-full font-bold',
          openCount > 0
            ? 'bg-primary-fixed text-on-primary-fixed dark:bg-blue-900/30 dark:text-dark-blue'
            : 'bg-surface-container dark:bg-dark-border text-on-surface-variant dark:text-dark-muted'
        )}>
          {openCount} פתוחות
        </span>
        <span className="text-xs px-3 py-1 rounded-full font-medium bg-surface-container dark:bg-dark-border text-on-surface-variant dark:text-dark-muted">
          {completedCount} הושלמו
        </span>
      </div>
    </div>
  )
}
