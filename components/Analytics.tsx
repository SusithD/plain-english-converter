'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { getUserId } from '@/lib/user'

declare global {
  interface Window {
    gtag: (
      event: 'config',
      gaId: string,
      config: {
        page_path: string;
        user_id: string;
      }
    ) => void;
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const userId = getUserId();
    const url = pathname + searchParams.toString()
    
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-M9RPXVLYRC', {
        page_path: url,
        user_id: userId,
      })
    }
  }, [pathname, searchParams])

  return null
}