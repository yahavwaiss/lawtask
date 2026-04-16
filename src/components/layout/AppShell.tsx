'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { FloatingActionButton } from './FloatingActionButton'
import { ThemeToggle } from './ThemeToggle'
import { TaskModal } from '@/components/tasks/TaskModal'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const pathname = usePathname()

  // If user is on a case page (/cases/[id]), pre-fill the case in the modal
  const caseIdFromPath = pathname?.match(/^\/cases\/([a-f0-9-]{36})/)?.[1] ?? null

  return (
    <div className="min-h-screen bg-app-primary flex">
      {/* Desktop sidebar — right side (RTL) */}
      <aside className="hidden md:flex w-64 shrink-0 bg-sidebar order-last border-l border-[#e7e8e9] dark:border-[#1e293b]">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile-only top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-[#f8f9fa]/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-[#c4c6d0]/15 dark:border-[#334155]">
          {/* Theme toggle — right side (RTL: visually on left) */}
          <ThemeToggle size="md" />

          {/* App name center */}
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-[#002452] dark:text-white text-base">LawTask</span>
            <span className="material-symbols-outlined filled text-[#002452] dark:text-sky-400 text-lg">gavel</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-24 md:pb-10 px-4 md:px-6 py-6 md:py-8 max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-40">
        <BottomNav />
      </nav>

      {/* FAB */}
      <FloatingActionButton onClick={() => setTaskModalOpen(true)} />

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        mode="create"
        defaultCaseId={caseIdFromPath}
        onSaved={(task) => {
          window.dispatchEvent(new CustomEvent('lawtask:task-saved', { detail: task }))
        }}
      />
    </div>
  )
}
