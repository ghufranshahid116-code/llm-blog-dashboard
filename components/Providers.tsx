'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { getAuthToken, setAuthToken } from '../lib/api'

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

useEffect(() => {
  const token = getAuthToken() // reads from localStorage
  if (!token && pathname !== '/login') {
    router.replace('/login')
  } else {
    // set memory token so Axios works immediately
    if (token) {setAuthToken(token)}
    setLoggedIn(true)
  }
  setLoading(false)
}, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000 },
        }}
      />
      {children}
    </QueryClientProvider>
  )
}
