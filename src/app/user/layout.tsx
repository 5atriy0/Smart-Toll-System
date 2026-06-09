import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
        <div className="flex flex-col min-h-screen bg-background">
          <Navbar branding />
          <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 md:pb-8">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
