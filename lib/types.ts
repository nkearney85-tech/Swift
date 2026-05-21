export type PropertyMode = 'watch' | 'guardian'

export interface Property {
  id: string
  owner_id: string
  name: string
  address: string
  jurisdiction: string
  mode: PropertyMode
  created_at: string
}

export interface Camera {
  id: string
  property_id: string
  name: string
  is_exterior: boolean
}

export type ShareStatus = 'active' | 'ended' | 'expired'
export type EndReason = 'manual' | 'auto_expired' | null

export interface Share {
  id: string
  property_id: string
  agency: string
  status: ShareStatus
  authorized_at: string
  expires_at: string
  ended_at: string | null
  ended_reason: EndReason
}

export interface AuditLogEntry {
  id: string
  property_id: string
  event: string
  detail: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
}
