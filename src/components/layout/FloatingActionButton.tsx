'use client'

import { useEffect } from 'react'

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onClick()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClick])

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 left-4 md:bottom-8 md:left-8 z-50 w-14 h-14 rounded-full
        bg-[linear-gradient(135deg,#002452,#1b3a6b)] dark:bg-sky-500
        text-white
        shadow-[0_4px_20px_rgba(0,36,82,0.3)] dark:shadow-[0_4px_20px_rgba(14,165,233,0.3)]
        flex items-center justify-center
        transition-all hover:scale-105 active:scale-90 duration-200
        border border-white/10"
      aria-label="הוסף משימה חדשה (N)"
      title="הוסף משימה (N)"
    >
      <span className="material-symbols-outlined text-3xl filled">add</span>
    </button>
  )
}
