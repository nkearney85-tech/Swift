'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Share } from '@/lib/types'
import { endShare } from '@/lib/store'

interface ActiveShareBannerProps {
  share: Share
  onEnded: () => void
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diffMs = expires.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Expired'
  
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m remaining`
  }
  return `${mins}m remaining`
}

export function ActiveShareBanner({ share, onEnded }: ActiveShareBannerProps) {
  const [loading, setLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(share.expires_at))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(share.expires_at))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [share.expires_at])

  async function handleEndShare() {
    setLoading(true)
    try {
      await endShare(share.id)
      onEnded()
    } catch (error) {
      console.error('Failed to end share:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-destructive text-destructive-foreground">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Warning header */}
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm uppercase tracking-wider">Active Emergency Share</span>
        </div>

        {/* Share details */}
        <div className="bg-black/20 rounded-lg p-3 mb-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">Shared with:</span>
              <span className="text-sm font-semibold">{share.agency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">Authorized:</span>
              <span className="text-sm font-semibold">{formatTime(share.authorized_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">Expires:</span>
              <span className="text-sm font-semibold">{formatTime(share.expires_at)}</span>
            </div>
          </div>
        </div>

        {/* Time remaining */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{timeRemaining}</span>
        </div>

        {/* End share button */}
        <Button
          onClick={handleEndShare}
          disabled={loading}
          variant="outline"
          className="w-full bg-transparent border-destructive-foreground/50 text-destructive-foreground hover:bg-destructive-foreground/10 hover:border-destructive-foreground font-semibold h-10"
        >
          <X className="w-4 h-4 mr-2" />
          {loading ? 'Ending...' : 'End Sharing Now'}
        </Button>
      </div>
    </div>
  )
}
