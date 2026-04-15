import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Stitch "The Judicial Atelier" — Light palette ───
        primary: {
          DEFAULT: '#002452',
          container: '#1b3a6b',
          fixed: '#d7e2ff',
          'fixed-dim': '#acc7ff',
        },
        secondary: {
          DEFAULT: '#0051d5',
          container: '#316bf3',
          fixed: '#dbe1ff',
          'fixed-dim': '#b4c5ff',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          bright: '#f8f9fa',
          dim: '#d9dadb',
          container: '#edeeef',
          'container-low': '#f3f4f5',
          'container-lowest': '#ffffff',
          'container-high': '#e7e8e9',
          'container-highest': '#e1e3e4',
          variant: '#e1e3e4',
          tint: '#425e91',
        },
        // On-colors
        'on-primary': '#ffffff',
        'on-primary-container': '#89a5dd',
        'on-primary-fixed': '#001a40',
        'on-primary-fixed-variant': '#294678',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#fefcff',
        'on-secondary-fixed': '#00174b',
        'on-secondary-fixed-variant': '#003ea8',
        'on-surface': '#191c1d',
        'on-surface-variant': '#44474f',
        'on-background': '#191c1d',
        // Outline
        outline: '#747780',
        'outline-variant': '#c4c6d0',
        // Tertiary (warm amber accents)
        tertiary: {
          DEFAULT: '#3c1e00',
          container: '#5b3000',
          fixed: '#ffdcc1',
          'fixed-dim': '#fcb87d',
        },
        'on-tertiary': '#ffffff',
        'on-tertiary-fixed': '#2e1500',
        'on-tertiary-fixed-variant': '#693c0a',
        'on-tertiary-container': '#d7985f',
        // Error
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        // ─── Dark mode overrides (slate/navy) ───
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'dark-text': '#f8fafc',
        'dark-muted': '#94a3b8',
        'dark-blue': '#3b82f6',
        // ─── Status ───
        overdue: '#ba1a1a',
        'overdue-bg': '#ffdad6',
        warning: '#fcb87d',
        success: '#4ade80',
        urgent: '#EA580C',
        // ─── Legacy aliases ───
        navy: '#002452',
        gold: '#fcb87d',
      },
      fontFamily: {
        headline: ['Manrope', 'Heebo', 'sans-serif'],
        sans: ['Heebo', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        legal: '0 12px 32px -4px rgba(0, 36, 82, 0.08)',
        'legal-sm': '0 1px 3px rgba(0, 36, 82, 0.05)',
        'legal-md': '0 4px 12px rgba(0, 36, 82, 0.08)',
        'dark-legal': '0 12px 32px -4px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #002452 0%, #1b3a6b 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #316bf3 0%, #0051d5 100%)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
