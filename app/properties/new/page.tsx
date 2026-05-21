'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProperty } from '@/lib/store'
import { PropertyMode } from '@/lib/types'

export default function NewPropertyPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [mode, setMode] = useState<PropertyMode>('watch')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await createProperty({
        name,
        address,
        jurisdiction,
        mode,
      })
      router.push('/properties')
    } catch (error) {
      console.error('Failed to create property:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <Link href="/properties" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">New Property</h1>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Property Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Residence"
              required
              className="bg-secondary border-border focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="text-sm text-muted-foreground">
              Address
            </Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Oak Street, Atlanta, GA 30301"
              required
              className="bg-secondary border-border focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="jurisdiction" className="text-sm text-muted-foreground">
              Responding Agency
            </Label>
            <Input
              id="jurisdiction"
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="Atlanta Police Department"
              required
              className="bg-secondary border-border focus:border-primary"
            />
          </div>

          {/* Mode Picker */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm text-muted-foreground">
              Operating Mode
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {/* Watch Mode */}
              <button
                type="button"
                onClick={() => setMode('watch')}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  mode === 'watch'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {mode === 'watch' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mode === 'watch' ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  <Eye className={`w-5 h-5 ${mode === 'watch' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`font-semibold text-sm ${mode === 'watch' ? 'text-primary' : 'text-foreground'}`}>
                  Watch
                </span>
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  Cameras only, no sharing
                </span>
              </button>

              {/* Guardian Mode */}
              <button
                type="button"
                onClick={() => setMode('guardian')}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  mode === 'guardian'
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border bg-card hover:border-destructive/50'
                }`}
              >
                {mode === 'guardian' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-destructive" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mode === 'guardian' ? 'bg-destructive/20' : 'bg-secondary'
                }`}>
                  <Shield className={`w-5 h-5 ${mode === 'guardian' ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
                <span className={`font-semibold text-sm ${mode === 'guardian' ? 'text-destructive' : 'text-foreground'}`}>
                  Guardian
                </span>
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  Opt-in emergency sharing
                </span>
              </button>
            </div>

            {/* Mode description */}
            <div className="mt-2 p-3 rounded-lg bg-secondary/50 border border-border">
              {mode === 'watch' ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Watch Mode:</strong> Your cameras record locally. No connection to law enforcement. You maintain complete privacy.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Guardian Mode:</strong> Enables opt-in emergency camera sharing with your responding agency. You authorize each share individually. Auto-terminates after 2 hours.
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 mt-4"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </Button>
        </form>
      </main>
    </div>
  )
}
