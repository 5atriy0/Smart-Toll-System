import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserNav } from './_components/UserNav'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
        <div className="flex flex-col min-h-screen bg-background">
          <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary))' }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
                  <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
                  <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2"/>
                  <line x1="16" y1="14" x2="16" y2="18" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <span className="font-bold text-sm tracking-widest text-foreground uppercase">Tollytics User</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
