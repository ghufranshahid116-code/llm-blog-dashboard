import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Providers from '../components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Sports Preview Generator',
  description: 'Generate AI-powered NHL game previews',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Header />
                <main className="p-6">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}