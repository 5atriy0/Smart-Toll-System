'use client'

import { Nfc, Loader2 } from 'lucide-react'
import { useNfcScan } from '@/hooks/useNfcScan'

interface Props {
  onScan: (uid: string) => void
  disabled?: boolean
}

export function NfcScanButton({ onScan, disabled }: Props) {
  const { nfcSupported, nfcReading, scanNfc } = useNfcScan()

  if (!nfcSupported) return null

  const handleClick = async () => {
    const uid = await scanNfc()
    if (uid) onScan(uid)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || nfcReading}
      className="shrink-0 px-3 py-2 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={nfcReading ? 'Tempelkan kartu ke perangkat...' : 'Scan NFC'}
    >
      {nfcReading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Nfc className="w-5 h-5" />
      )}
    </button>
  )
}
