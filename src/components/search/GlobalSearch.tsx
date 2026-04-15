'use client'

import { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils/date'
import { TASK_TYPE_LABEL, PRIORITY_LABEL } from '@/lib/constants'
import { clsx } from 'clsx'

interface SearchTask {
  id: string
  title: string
  type: string
  status: string
  due_date: string | null
  priority: string
}

interface SearchCase {
  id: string
  case_number: string
  case_name: string
  court: string | null
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tasks, setTasks] = useState<SearchTask[]>([])
  const [cases, setCases] = useState<SearchCase[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  // Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setTasks([])
      setCases([])
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setTasks(data.tasks ?? [])
        setCases(data.cases ?? [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  function handleClose() {
    setOpen(false)
    setQuery('')
    setTasks([])
    setCases([])
  }

  const hasResults = tasks.length > 0 || cases.length > 0

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-app-secondary bg-app-secondary hover:bg-app-card border border-app rounded-xl transition-colors w-full md:w-64"
      >
        <span>🔍</span>
        <span className="flex-1 text-right">חיפוש...</span>
        <kbd className="text-xs bg-app-card border border-app rounded px-1.5 py-0.5 hidden md:block">⌘K</kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-[10%] inset-x-4 md:inset-auto md:top-[10%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 bg-app-card border border-app rounded-2xl shadow-2xl overflow-hidden">
            <Dialog.Title className="sr-only">חיפוש גלובלי</Dialog.Title>

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-app">
              <span className="text-app-secondary">🔍</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חפש משימות, תיקים, מספרי הליך..."
                className="flex-1 bg-transparent text-app-primary placeholder:text-app-secondary focus:outline-none text-sm"
              />
              {loading && <span className="text-app-secondary text-xs">מחפש...</span>}
              <button onClick={handleClose} className="text-app-secondary hover:text-app-primary text-lg">✕</button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {!query || query.length < 2 ? (
                <div className="px-4 py-8 text-center text-sm text-app-secondary">
                  הקלד לפחות 2 תווים לחיפוש
                </div>
              ) : !hasResults && !loading ? (
                <div className="px-4 py-8 text-center text-sm text-app-secondary">
                  לא נמצאו תוצאות עבור &quot;{query}&quot;
                </div>
              ) : (
                <div className="py-2">
                  {tasks.length > 0 && (
                    <div>
                      <p className="px-4 py-1.5 text-xs font-semibold text-app-secondary uppercase tracking-wide">משימות</p>
                      {tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            router.push('/tasks')
                            handleClose()
                          }}
                          className="w-full text-right px-4 py-3 hover:bg-app-secondary transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={clsx('text-sm font-medium', t.status === 'completed' && 'line-through text-app-secondary')}>
                              {t.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs text-app-secondary">{TASK_TYPE_LABEL[t.type]}</span>
                              {t.due_date && (
                                <span className="text-xs text-app-secondary">{formatDate(t.due_date)}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {cases.length > 0 && (
                    <div>
                      {tasks.length > 0 && <div className="border-t border-app my-1" />}
                      <p className="px-4 py-1.5 text-xs font-semibold text-app-secondary uppercase tracking-wide">תיקים</p>
                      {cases.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            router.push(`/cases/${c.id}`)
                            handleClose()
                          }}
                          className="w-full text-right px-4 py-3 hover:bg-app-secondary transition-colors"
                        >
                          <div className="text-sm font-medium text-app-primary">{c.case_name}</div>
                          <div className="text-xs text-app-secondary mt-0.5">
                            {c.case_number}{c.court && ` · ${c.court}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-app px-4 py-2 flex items-center gap-3 text-xs text-app-secondary">
              <span>↵ לפתיחה</span>
              <span>Esc לסגירה</span>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
