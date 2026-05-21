'use client'

import { useState } from 'react'
import { X, Video, Clock, AlertTriangle, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Property, Camera } from '@/lib/types'
import { createShare } from '@/lib/store'

interface ConsentSheetProps {
  property: Property
  cameras: Camera[]
  onClose: () => void
  onAuthorized: () => void
}

export function ConsentSheet({ property, cameras, onClose, onAuthorized }: ConsentSheetProps) {
  const [selectedCameras, setSelectedCameras] = useState<Set<string>>(new Set(cameras.map(c => c.id)))
  const [loading, setLoading] = useState(false)

  function toggleCamera(cameraId: string) {
    const newSelected = new Set(selectedCameras)
    if (newSelected.has(cameraId)) {
      newSelected.delete(cameraId)
    } else {
      newSelected.add(cameraId)
    }
    setSelectedCameras(newSelected)
  }

  async function handleAuthorize() {
    if (selectedCameras.size === 0) return
    
    setLoading(true)
    try {
      await createShare(property.id, property.jurisdiction, Array.from(selectedCameras))
      onAuthorized()
    } catch (error) {
      console.error('Failed to create share:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Emergency Camera Share</h2>
            <p className="text-sm text-destructive font-medium">{property.jurisdiction}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Camera Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Select Cameras to Share
            </h3>
            <div className="flex flex-col gap-2">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  type="button"
                  onClick={() => toggleCamera(camera.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedCameras.has(camera.id)
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border bg-secondary/50 hover:border-border/80'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedCameras.has(camera.id) ? 'bg-destructive/20' : 'bg-secondary'
                  }`}>
                    <Video className={`w-4 h-4 ${
                      selectedCameras.has(camera.id) ? 'text-destructive' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <span className={`flex-1 text-left font-medium text-sm ${
                    selectedCameras.has(camera.id) ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {camera.name}
                  </span>
                  {selectedCameras.has(camera.id) && (
                    <Check className="w-4 h-4 text-destructive" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Disclosures */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Includes 15 minutes before the alarm</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your own recording from before the incident will be included
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">2-hour auto-termination</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Access automatically expires. No interior cameras will ever be shared.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          <Button
            onClick={handleAuthorize}
            disabled={loading || selectedCameras.size === 0}
            className="w-full h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {loading ? 'Authorizing...' : `Authorize ${selectedCameras.size} Camera${selectedCameras.size !== 1 ? 's' : ''}`}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-12 border-border text-foreground hover:bg-secondary font-semibold"
          >
            <Lock className="w-4 h-4 mr-2" />
            Keep Cameras Locked
          </Button>
        </div>
      </div>
    </div>
  )
}
