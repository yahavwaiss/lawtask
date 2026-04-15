export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#002452]/5 dark:bg-sky-500/5 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#316bf3]/5 dark:bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#002452] to-[#1b3a6b] mb-4 shadow-[0_8px_24px_rgba(0,36,82,0.25)]">
            <span className="material-symbols-outlined filled text-white text-3xl">gavel</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-[#002452] dark:text-white tracking-tight">
            LawTask
          </h1>
          <p className="text-[#44474f] dark:text-[#94a3b8] text-sm mt-1.5">
            ניהול משימות משפטיות
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
