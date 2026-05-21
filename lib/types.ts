export type PropertyMode = 'watch' | 'guardian'

export interface Property {
  id: string
  owner_id: string
  name: string
  address: string
  jurisdiction: string
  mode: PropertyMode
  preroll_minutes: number
  created_at: string
}

export type CameraKind = 'flock' | 'third_party'

export interface Camera {
  id: string
  property_id: string
  name: string
  camera_kind: CameraKind
  is_interior: boolean
}

export type ShareStatus = 'active' | 'ended' | 'expired'
export type EndReason = 'manual' | 'auto_expired' | null
export type ShareKind = 'emergency' | 'scheduled'

export interface Share {
  id: string
  property_id: string
  authorized_by: string
  agency: string
  status: ShareStatus
  share_kind: ShareKind
  preroll_minutes: number
  authorized_at: string
  expires_at: string
  ended_at: string | null
  ended_reason: EndReason
}

export interface ShareCamera {
  share_id: string
  camera_id: string
}

export interface AuditLogEntry {
  id: string
  property_id: string
  share_id: string | null
  event: string
  detail: string | null
  actor: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
}
