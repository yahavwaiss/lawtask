import type { Metadata } from 'next'
import { Heebo, Manrope } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LawTask — ניהול משימות משפטיות',
  description: 'מערכת ניהול משימות לעורכי דין',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LawTask',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Material Symbols Outlined — variable font for icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className={`${heebo.variable} ${manrope.variable} ${heebo.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#191c1d',
                border: '1px solid rgba(196, 198, 208, 0.5)',
                fontFamily: 'inherit',
                direction: 'rtl',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 36, 82, 0.08)',
              },
              success: {
                iconTheme: { primary: '#4ade80', secondary: '#ffffff' },
              },
              error: {
                iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
