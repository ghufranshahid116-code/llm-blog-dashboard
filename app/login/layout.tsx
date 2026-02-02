import { Inter } from 'next/font/google'
import '../../styles/globals.css'
import Providers from '../../components/Providers'

const inter = Inter({ subsets: ['latin'] })

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
