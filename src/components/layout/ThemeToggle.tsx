'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface ThemeToggleProps {
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function ThemeToggle({ size = 'sm', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  if (!mounted) {
    return (
      <div className={clsx(
        'rounded-full flex items-center justify-center bg-[#edeeef] dark:bg-[#1e293b]',
        size === 'md' ? 'w-10 h-10' : 'w-8 h-8'
      )} />
    )
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={clsx(
        'rounded-full flex items-center justify-center gap-2 transition-all duration-200 active:scale-90',
        'bg-[#edeeef] dark:bg-[#1e293b] hover:bg-[#e1e3e4] dark:hover:bg-[#334155]',
        'text-[#44474f] dark:text-[#94a3b8]',
        size === 'md' ? 'w-10 h-10' : 'w-8 h-8',
        showLabel && 'px-4 w-auto rounded-xl gap-2'
      )}
      aria-label={isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      title={isDark ? 'מצב בהיר' : 'מצב כהה'}
    >
      <span className={clsx(
        'material-symbols-outlined',
        size === 'md' ? 'text-xl' : 'text-lg'
      )}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'מצב בהיר' : 'מצב כהה'}
        </span>
      )}
    </button>
  )
}
