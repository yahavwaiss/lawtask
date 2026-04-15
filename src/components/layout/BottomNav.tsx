'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const tabs = [
  { href: '/dashboard', label: 'בית',     icon: 'home'          },
  { href: '/tasks',     label: 'משימות',  icon: 'assignment'    },
  { href: '/cases',     label: 'תיקים',   icon: 'briefcase_meal'},
  { href: '/archive',   label: 'ארכיון',  icon: 'inventory_2'   },
  { href: '/settings',  label: 'הגדרות',  icon: 'settings'      },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="glass-nav border-t border-[#c4c6d0]/15 dark:border-[#334155] shadow-[0_-4px_20px_-2px_rgba(0,36,82,0.06)] dark:shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.4)]">
      <div className="flex flex-row-reverse justify-around items-center px-2 pb-6 pt-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/tasks'
              ? pathname === '/tasks' || pathname.startsWith('/tasks/')
              : tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 active:scale-90',
                isActive
                  ? 'text-[#0051d5] dark:text-sky-400 bg-[#d7e2ff]/40 dark:bg-blue-900/30'
                  : 'text-[#747780] dark:text-[#94a3b8] hover:text-[#002452] dark:hover:text-white'
              )}
            >
              <span className={clsx(
                'material-symbols-outlined text-2xl leading-none',
                isActive ? 'filled' : ''
              )}>
                {tab.icon}
              </span>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
