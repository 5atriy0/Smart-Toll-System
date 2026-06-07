import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import '@/styles/globals.scss'
import { ToastWrapper } from '@/components/ui/ToastWrapper'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Tollytics — Dashboard Tol Pintar',
  description: 'Dashboard monitoring dan manajemen sistem tol elektronik terintegrasi.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={sora.variable} suppressHydrationWarning>
      <head />
      <body className="bg-background text-foreground font-sora antialiased" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `}
        </Script>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Loncat ke konten utama
        </a>
        <ToastWrapper>{children}</ToastWrapper>
      </body>
    </html>
  )
}
