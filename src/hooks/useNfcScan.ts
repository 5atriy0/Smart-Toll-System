'use client'

import { useState, useCallback } from 'react'

const isNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window

export function useNfcScan() {
  const [nfcReading, setNfcReading] = useState(false)

  const scanNfc = useCallback(async (): Promise<string | null> => {
    if (!isNfcSupported) return null
    setNfcReading(true)
    try {
      const reader = new NDEFReader()
      await reader.scan()
      return await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          reader.onreading = null
          reader.onreadingerror = null
          setNfcReading(false)
          resolve(null)
        }, 30000)
        reader.onreading = ({ serialNumber }) => {
          clearTimeout(timeout)
          reader.onreading = null
          reader.onreadingerror = null
          setNfcReading(false)
          const cleaned = (serialNumber || '').replace(/:/g, '').toUpperCase()
          resolve(cleaned || null)
        }
        reader.onreadingerror = () => {
          clearTimeout(timeout)
          reader.onreading = null
          reader.onreadingerror = null
          setNfcReading(false)
          resolve(null)
        }
      })
    } catch {
      setNfcReading(false)
      return null
    }
  }, [])

  return { nfcSupported: isNfcSupported, nfcReading, scanNfc } as const
}
