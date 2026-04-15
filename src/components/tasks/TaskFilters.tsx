'use client'

import { PRIORITY_LABEL, ISRAELI_COURTS } from '@/lib/constants'

export interface FilterState {
  type: '' | 'work' | 'personal'
  priority: '' | 'urgent' | 'normal' | 'low'
  court: string
  sort_by: 'due_date' | 'priority' | 'created_at' | 'title'
  sort_dir: 'asc' | 'desc'
}

interface TaskFiltersProps {
  filters: FilterState
  onChange: (f: Partial<FilterState>) => void
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Type */}
      <select
        value={filters.type}
        onChange={(e) => onChange({ type: e.target.value as FilterState['type'] })}
        className="text-sm px-3 py-1.5 rounded-xl border border-app bg-app-card text-app-primary focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        <option value="">כל הסוגים</option>
        <option value="work">💼 עבודה</option>
        <option value="personal">👤 אישי</option>
      </select>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(e) => onChange({ priority: e.target.value as FilterState['priority'] })}
        className="text-sm px-3 py-1.5 rounded-xl border border-app bg-app-card text-app-primary focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        <option value="">כל העדיפויות</option>
        {(['urgent', 'normal', 'low'] as const).map((p) => (
          <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
        ))}
      </select>

      {/* Court */}
      <select
        value={filters.court}
        onChange={(e) => onChange({ court: e.target.value })}
        className="text-sm px-3 py-1.5 rounded-xl border border-app bg-app-card text-app-primary focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        <option value="">כל בתי המשפט</option>
        {ISRAELI_COURTS.map((c) => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={`${filters.sort_by}:${filters.sort_dir}`}
        onChange={(e) => {
          const [by, dir] = e.target.value.split(':')
          onChange({ sort_by: by as FilterState['sort_by'], sort_dir: dir as FilterState['sort_dir'] })
        }}
        className="text-sm px-3 py-1.5 rounded-xl border border-app bg-app-card text-app-primary focus:outline-none focus:ring-2 focus:ring-navy/30"
      >
        <option value="due_date:asc">מיון: תאריך יעד ↑</option>
        <option value="due_date:desc">מיון: תאריך יעד ↓</option>
        <option value="priority:asc">מיון: עדיפות</option>
        <option value="created_at:desc">מיון: נוצר לאחרונה</option>
        <option value="title:asc">מיון: כותרת א-ת</option>
      </select>
    </div>
  )
}
