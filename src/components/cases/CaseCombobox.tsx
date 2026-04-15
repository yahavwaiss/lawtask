'use client'

import { useState, useEffect, useRef } from 'react'
import type { Case } from '@/types/task'
import { CASE_NUMBER_REGEX, ISRAELI_COURTS } from '@/lib/constants'
import toast from 'react-hot-toast'

interface CaseComboboxProps {
  selectedCaseId: string | null
  onSelectCase: (caseId: string | null, caseData?: Case) => void
  initialCourtValue?: string | null
}

export function CaseCombobox({ selectedCaseId, onSelectCase, initialCourtValue }: CaseComboboxProps) {
  const [query, setQuery] = useState('')
  const [cases, setCases] = useState<Case[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  // New case creation state
  const [creatingNew, setCreatingNew] = useState(false)
  const [newCaseNumber, setNewCaseNumber] = useState('')
  const [newCaseCourt, setNewCaseCourt] = useState(initialCourtValue || '')
  const [newCaseLoading, setNewCaseLoading] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  // Load cases
  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCases(data)
      })
      .catch(() => {})
  }, [])

  // Load initially selected case
  useEffect(() => {
    if (selectedCaseId && cases.length > 0) {
      const found = cases.find((c) => c.id === selectedCaseId)
      if (found) {
        setSelectedCase(found)
        setQuery(found.case_name)
      }
    }
  }, [selectedCaseId, cases])

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const filtered = cases.filter(
    (c) =>
      c.case_name.toLowerCase().includes(query.toLowerCase()) ||
      c.case_number.toLowerCase().includes(query.toLowerCase())
  )

  function handleSelectCase(c: Case) {
    setSelectedCase(c)
    setQuery(c.case_name)
    onSelectCase(c.id, c)
    setOpen(false)
    setCreatingNew(false)
  }

  function handleClear() {
    setSelectedCase(null)
    setQuery('')
    onSelectCase(null)
  }

  async function handleCreateCase() {
    if (!query.trim()) return
    if (!CASE_NUMBER_REGEX.test(newCaseNumber)) {
      toast.error('מספר הליך חייב להיות בפורמט xxx-xx-xx')
      return
    }

    setNewCaseLoading(true)
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_name: query.trim(),
          case_number: newCaseNumber,
          court: newCaseCourt || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create case')
      }
      const newCase: Case = await res.json()
      setCases((prev) => [...prev, newCase])
      handleSelectCase(newCase)
      toast.success('תיק חדש נוצר')
      setCreatingNew(false)
      setNewCaseNumber('')
      setNewCaseCourt('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'שגיאה ביצירת תיק')
    } finally {
      setNewCaseLoading(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              if (!e.target.value) {
                setSelectedCase(null)
                onSelectCase(null)
              }
            }}
            onFocus={() => setOpen(true)}
            placeholder="חפש תיק..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-app bg-app-secondary text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
          />
          {selectedCase && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-app-secondary hover:text-app-primary"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Selected case info */}
      {selectedCase && (
        <div className="mt-1.5 text-xs text-app-secondary">
          📋 {selectedCase.case_number}
          {selectedCase.court && ` · ${selectedCase.court}`}
        </div>
      )}

      {/* Dropdown */}
      {open && query && (
        <div className="absolute top-full mt-1 inset-x-0 z-50 bg-app-card border border-app rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCase(c)}
                  className="w-full text-right px-4 py-3 hover:bg-app-secondary transition-colors text-sm"
                >
                  <div className="font-medium text-app-primary">{c.case_name}</div>
                  <div className="text-xs text-app-secondary mt-0.5">
                    {c.case_number}{c.court && ` · ${c.court}`}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-app-secondary">לא נמצא תיק מתאים</div>
            )}
          </div>

          {/* Create new case */}
          {!creatingNew ? (
            <button
              type="button"
              onClick={() => setCreatingNew(true)}
              className="w-full text-right px-4 py-3 border-t border-app text-sm text-action-blue hover:bg-app-secondary transition-colors"
            >
              ➕ צור תיק חדש: &quot;{query}&quot;
            </button>
          ) : (
            <div className="border-t border-app p-3 space-y-2">
              <p className="text-xs font-medium text-app-primary">יצירת תיק חדש: &quot;{query}&quot;</p>
              <input
                value={newCaseNumber}
                onChange={(e) => setNewCaseNumber(e.target.value)}
                placeholder="מספר הליך (xxx-xx-xx)"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-app bg-app-secondary text-app-primary placeholder:text-app-secondary focus:outline-none focus:ring-1 focus:ring-navy"
              />
              <select
                value={newCaseCourt}
                onChange={(e) => setNewCaseCourt(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-app bg-app-secondary text-app-primary focus:outline-none focus:ring-1 focus:ring-navy"
              >
                <option value="">בחר בית משפט (אופציונלי)</option>
                {ISRAELI_COURTS.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateCase}
                  disabled={newCaseLoading}
                  className="flex-1 py-1.5 text-sm bg-navy text-white rounded-lg hover:bg-navy/90 disabled:opacity-50 transition-colors"
                >
                  {newCaseLoading ? 'יוצר...' : 'צור תיק'}
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingNew(false)}
                  className="px-3 py-1.5 text-sm border border-app rounded-lg hover:bg-app-secondary transition-colors text-app-secondary"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
