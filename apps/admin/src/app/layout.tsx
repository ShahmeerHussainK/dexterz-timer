import type { Metadata } from 'next'
import { Darker_Grotesque } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const darkerGrotesque = Darker_Grotesque({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Time Tracker Admin',
  description: 'Time tracking administration panel',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={darkerGrotesque.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
