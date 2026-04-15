'use client'

import { useState, useEffect } from 'react'
import { CaseCard } from '@/components/cases/CaseCard'
import { DeleteCaseDialog } from '@/components/cases/DeleteCaseDialog'
import type { Case } from '@/types/task'
import toast from 'react-hot-toast'

interface CaseWithTasks extends Case {
  tasks?: { id: string; status: string }[]
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<CaseWithTasks | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCases(data)
      })
      .catch(() => toast.error('שגיאה בטעינת תיקים'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/cases/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setCases((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      toast.success('תיק נמחק')
      setDeleteTarget(null)
    } catch {
      toast.error('שגיאה במחיקת תיק')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-app-primary mb-6">🗂️ תיקים</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-app-card border border-app rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-primary">🗂️ תיקים</h1>
        <p className="text-app-secondary text-sm mt-1">{cases.length} תיקים פעילים</p>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-app-secondary">אין תיקים עדיין. צור תיק בעת הוספת משימת עבודה.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => {
            const tasks = c.tasks ?? []
            const openCount = tasks.filter((t) => t.status === 'pending').length
            const completedCount = tasks.filter((t) => t.status === 'completed').length
            return (
              <CaseCard
                key={c.id}
                id={c.id}
                case_number={c.case_number}
                case_name={c.case_name}
                court={c.court}
                openCount={openCount}
                completedCount={completedCount}
                onDelete={() => setDeleteTarget(c)}
              />
            )
          })}
        </div>
      )}

      <DeleteCaseDialog
        open={!!deleteTarget}
        caseName={deleteTarget?.case_name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
