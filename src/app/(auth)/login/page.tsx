'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים' : error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-8 shadow-[0_12px_40px_rgba(0,36,82,0.10)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-[#c4c6d0]/20 dark:border-[#334155]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-[#002452] dark:text-white">כניסה</h2>
        <p className="text-[#44474f] dark:text-[#94a3b8] text-sm mt-1">ברוך הבא בחזרה</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#44474f] dark:text-[#94a3b8] mr-1">
            אימייל
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#747780] dark:text-[#94a3b8] text-xl pointer-events-none">mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full pr-10 pl-4 py-3.5 bg-[#f3f4f5] dark:bg-[#0f172a] text-[#191c1d] dark:text-[#f8fafc] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#0051d5]/20 dark:focus:ring-sky-500/20 placeholder:text-[#747780] dark:placeholder:text-[#475569] text-sm transition-all"
              dir="ltr"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#44474f] dark:text-[#94a3b8] mr-1">
            סיסמה
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#747780] dark:text-[#94a3b8] text-xl pointer-events-none">lock</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pr-10 pl-4 py-3.5 bg-[#f3f4f5] dark:bg-[#0f172a] text-[#191c1d] dark:text-[#f8fafc] rounded-xl border-none outline-none focus:ring-2 focus:ring-[#0051d5]/20 dark:focus:ring-sky-500/20 placeholder:text-[#747780] dark:placeholder:text-[#475569] text-sm transition-all"
              dir="ltr"
            />
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-gradient-to-br from-[#002452] to-[#1b3a6b] text-white font-bold text-base shadow-[0_8px_24px_rgba(0,36,82,0.25)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              נכנס...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined filled text-xl">login</span>
              כניסה
            </>
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-[#44474f] dark:text-[#94a3b8] mt-8">
        אין לך חשבון?{' '}
        <Link href="/register" className="text-[#0051d5] dark:text-sky-400 hover:underline font-semibold">
          הירשם כאן
        </Link>
      </p>
    </div>
  )
}
