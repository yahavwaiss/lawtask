'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'ראשי',   icon: 'home',           },
  { href: '/tasks',     label: 'משימות', icon: 'assignment',      },
  { href: '/cases',     label: 'תיקים',  icon: 'briefcase_meal',  },
  { href: '/archive',   label: 'ארכיון', icon: 'inventory_2',     },
  { href: '/settings',  label: 'הגדרות', icon: 'settings',        },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f5] dark:bg-[#0f172a] sticky top-0 w-full">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined filled text-[#002452] dark:text-sky-400 text-2xl">gavel</span>
          <div>
            <h1 className="text-lg font-headline font-bold text-[#002452] dark:text-white tracking-tight leading-none">
              LawTask
            </h1>
            <p className="text-[10px] text-[#747780] dark:text-[#94a3b8] mt-0.5">האטלייה השיפוטי</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/tasks'
              ? pathname === '/tasks' || pathname.startsWith('/tasks/')
              : item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-[#d7e2ff]/60 dark:bg-blue-500/15 text-[#0051d5] dark:text-sky-400 font-bold'
                  : 'text-[#44474f] dark:text-[#94a3b8] hover:bg-[#edeeef] dark:hover:bg-[#1e293b] hover:text-[#191c1d] dark:hover:text-white'
              )}
            >
              <span className={clsx(
                'material-symbols-outlined text-xl shrink-0',
                isActive ? 'filled' : ''
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[#0051d5] dark:bg-sky-400 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* New Case CTA */}
      <div className="px-4 pb-3">
        <button className="w-full py-3 rounded-xl bg-gradient-to-br from-[#002452] to-[#1b3a6b] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#002452]/20 active:scale-95 transition-all hover:opacity-90">
          <span className="material-symbols-outlined text-lg">add</span>
          תיק חדש
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#e7e8e9] dark:border-[#1e293b]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#d7e2ff] dark:bg-[#1e293b] flex items-center justify-center text-[#002452] dark:text-sky-400 text-xs font-bold shrink-0">
              ע
            </div>
            <span className="text-xs text-[#44474f] dark:text-[#94a3b8] truncate">עורך דין</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#edeeef] dark:hover:bg-[#1e293b] transition-colors text-[#44474f] dark:text-[#94a3b8] hover:text-[#ba1a1a] dark:hover:text-red-400"
              title="התנתק"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
