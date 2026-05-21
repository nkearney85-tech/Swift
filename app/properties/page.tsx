'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, MapPin, LogOut, Shield, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SwiftLogo } from '@/components/swift-logo'
import { getProperties, signOut } from '@/lib/store'
import { Property } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ModePill({ mode }: { mode: 'watch' | 'guardian' }) {
  if (mode === 'guardian') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
        <Shield className="w-3 h-3" />
        Guardian
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
      <Eye className="w-3 h-3" />
      Watch
    </span>
  )
}

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
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
        
        setUserEmail(result.data.user.email ?? null)
        const props = await getProperties()
        setProperties(props)
        setLoading(false)
      } catch {
        // On any error, redirect to login
        router.push('/login')
      }
    }
    loadData()
  }, [router])

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <SwiftLogo className="h-7 w-auto" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">My Properties</h1>
            {userEmail && (
              <p className="text-sm text-muted-foreground mt-0.5">{userEmail}</p>
            )}
          </div>
          <Link href="/properties/new">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </Link>
        </div>

        {/* Properties list */}
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">No properties yet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Add your first property to get started
            </p>
            <Link href="/properties/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {property.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{property.address}</span>
                      </p>
                    </div>
                    <ModePill mode={property.mode} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
