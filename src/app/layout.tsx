import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/globals.scss'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Toll System Dashboard',
  description: 'Enterprise-grade IoT Smart Toll Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background`}>
        {children}
      </body>
    </html>
  )
}
