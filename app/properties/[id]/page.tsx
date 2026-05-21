'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Video, 
  Clock, 
  MapPin,
  ShieldOff,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  getProperty, 
  getCameras, 
  getAuditLog, 
  getActiveShare,
} from '@/lib/store'
import { Property, Camera, AuditLogEntry, Share } from '@/lib/types'
import { ConsentSheet } from '@/components/consent-sheet'
import { ActiveShareBanner } from '@/components/active-share-banner'
import { createClient } from '@/lib/supabase/client'

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [cameras, setCameras] = useState<Camera[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [activeShare, setActiveShare] = useState<Share | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConsentSheet, setShowConsentSheet] = useState(false)

  async function loadData() {
    const supabase = createClient()
    
    // Create a timeout promise
    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 3000) // 3 second timeout
    })
    
    try {
      // Race the auth check against the timeout
      const result = await Promise.race([
        supabase.auth.getUser(),
        timeout,
      ])
      
      // If timeout won or no user, redirect to login
      if (!result || !('data' in result) || !result.data.user) {
        router.push('/login')
        return
      }

      const [prop, cams, log, share] = await Promise.all([
        getProperty(id),
        getCameras(id),
        getAuditLog(id),
        getActiveShare(id),
      ])

      if (!prop) {
        router.push('/properties')
        return
      }

      setProperty(prop)
      setCameras(cams)
      setAuditLog(log)
      setActiveShare(share)
      setLoading(false)
    } catch {
      router.push('/login')
    }
  }

  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router])

  function handleShareCreated() {
    setShowConsentSheet(false)
    loadData()
  }

  function handleShareEnded() {
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!property) return null

  return (
    <div className="min-h-screen flex flex-col pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <Link href="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{property.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.address}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            property.mode === 'guardian'
              ? 'bg-destructive/15 text-destructive'
              : 'bg-primary/15 text-primary'
          }`}>
            {property.mode === 'guardian' ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {property.mode === 'guardian' ? 'Guardian' : 'Watch'}
          </div>
        </div>
      </header>

      {/* Active Share Banner */}
      {activeShare && (
        <ActiveShareBanner share={activeShare} onEnded={handleShareEnded} />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Cameras Section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Exterior Cameras
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {cameras.filter(c => !c.is_interior).map((camera) => (
              <Card key={camera.id} className="p-3 bg-card border-border">
                <div className="aspect-video bg-secondary rounded-md flex items-center justify-center mb-2">
                  <Video className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground truncate">{camera.name}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Mode-specific action */}
        <section className="mb-8">
          {property.mode === 'guardian' ? (
            activeShare ? null : (
              <Button
                onClick={() => setShowConsentSheet(true)}
                className="w-full h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Authorize Emergency Share
              </Button>
            )
          ) : (
            <Card className="p-4 bg-primary/10 border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShieldOff className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm">Law enforcement sharing is OFF</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This property is in Watch Mode. Your cameras are private.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* Audit Log Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Audit Log
          </h2>
          <div className="flex flex-col gap-2">
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No events recorded</p>
            ) : (
              auditLog.map((entry) => (
                <Card key={entry.id} className="p-3 bg-card border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {entry.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      {entry.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {entry.detail}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(entry.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Consent Sheet */}
      {showConsentSheet && property && (
        <ConsentSheet
          property={property}
          cameras={cameras.filter(c => !c.is_interior)}
          onClose={() => setShowConsentSheet(false)}
          onAuthorized={handleShareCreated}
        />
      )}
    </div>
  )
}
