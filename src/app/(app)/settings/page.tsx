'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [linked, setLinked] = useState<boolean | null>(null)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [codeExpiry, setCodeExpiry] = useState<Date | null>(null)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user email
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })

    // Check telegram link status
    fetch('/api/settings/telegram')
      .then((r) => r.json())
      .then((data) => setLinked(data.linked ?? false))
      .catch(() => setLinked(false))
  }, [])

  async function handleGenerateCode() {
    setGeneratingCode(true)
    try {
      const res = await fetch('/api/settings/telegram', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLinkCode(data.code)
      setCodeExpiry(new Date(data.expiresAt))
      toast.success('קוד נוצר! תקף ל-15 דקות')
    } catch {
      toast.error('שגיאה ביצירת קוד')
    } finally {
      setGeneratingCode(false)
    }
  }

  async function handleUnlink() {
    if (!confirm('לנתק את חשבון הטלגרם?')) return
    setUnlinking(true)
    try {
      const res = await fetch('/api/settings/telegram', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setLinked(false)
      setLinkCode(null)
      toast.success('חשבון טלגרם נותק')
    } catch {
      toast.error('שגיאה בניתוק')
    } finally {
      setUnlinking(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-app-primary">⚙️ הגדרות</h1>
        <p className="text-app-secondary text-sm mt-1">ניהול חשבון ואינטגרציות</p>
      </div>

      {/* Profile */}
      <div className="bg-app-card border border-app rounded-2xl p-5 mb-4">
        <h2 className="text-lg font-semibold text-app-primary mb-3">👤 פרופיל</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white text-lg font-bold">
            {userEmail?.[0]?.toUpperCase() ?? 'ע'}
          </div>
          <div>
            <p className="font-medium text-app-primary">{userEmail ?? '...'}</p>
            <p className="text-xs text-app-secondary">עורך דין</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 text-sm border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          התנתק
        </button>
      </div>

      {/* Telegram Integration */}
      <div className="bg-app-card border border-app rounded-2xl p-5 mb-4">
        <h2 className="text-lg font-semibold text-app-primary mb-1">📱 טלגרם</h2>
        <p className="text-sm text-app-secondary mb-4">
          קשר את חשבון הטלגרם שלך לקבלת התראות ולהוספת משימות דרך הבוט.
        </p>

        {linked === null ? (
          <div className="h-10 bg-app-secondary rounded-xl animate-pulse" />
        ) : linked ? (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-green-700 dark:text-green-400">חשבון טלגרם מקושר</span>
            </div>
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="w-full py-2.5 text-sm border border-app rounded-xl text-app-secondary hover:bg-app-secondary disabled:opacity-50 transition-colors"
            >
              {unlinking ? 'מנתק...' : 'נתק חשבון טלגרם'}
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-app-secondary rounded-xl p-4 mb-4 space-y-2 text-sm text-app-primary">
              <p><strong>איך לקשר:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-app-secondary">
                <li>לחץ &quot;צור קוד קישור&quot;</li>
                <li>פתח את בוט הטלגרם</li>
                <li>שלח לבוט: <code className="bg-app-card px-1.5 py-0.5 rounded text-xs">/link [הקוד שלך]</code></li>
              </ol>
            </div>

            {linkCode && codeExpiry && (
              <div className="mb-4 p-4 bg-navy/10 dark:bg-navy/20 rounded-xl border border-navy/20">
                <p className="text-xs text-app-secondary mb-1">הקוד שלך (תקף עד {codeExpiry.toLocaleTimeString('he-IL')}):</p>
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-bold tracking-widest text-navy">{linkCode}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`/link ${linkCode}`); toast.success('הועתק!') }}
                    className="text-xs text-action-blue hover:underline"
                  >
                    העתק פקודה
                  </button>
                </div>
                <p className="text-xs text-app-secondary mt-1">שלח לבוט: /link {linkCode}</p>
              </div>
            )}

            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="w-full py-2.5 text-sm bg-navy text-white rounded-xl font-medium hover:bg-navy/90 disabled:opacity-50 transition-colors"
            >
              {generatingCode ? 'יוצר קוד...' : linkCode ? 'צור קוד חדש' : 'צור קוד קישור'}
            </button>
          </div>
        )}
      </div>

      {/* App Info */}
      <div className="bg-app-card border border-app rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-app-primary mb-3">ℹ️ אודות</h2>
        <div className="space-y-2 text-sm text-app-secondary">
          <p>⚖️ LawTask — מערכת ניהול משימות לעורכי דין</p>
          <p>גרסה 0.1.0</p>
          <div className="mt-3 pt-3 border-t border-app space-y-1">
            <p className="text-xs">🔐 כל הנתונים מוצפנים ומאובטחים</p>
            <p className="text-xs">🇮🇱 מפותח לשוק הישראלי</p>
          </div>
        </div>
      </div>
    </div>
  )
}
