'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (
      event: 'config',
      gaId: string,
      config: {
        page_path: string;
      }
    ) => void;
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + searchParams.toString()
    
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-M9RPXVLYRC', {
        page_path: url,
      })
    }
  }, [pathname, searchParams])

  return null
}