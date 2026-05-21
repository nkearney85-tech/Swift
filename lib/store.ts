'use client'

import { Property, Camera, Share, AuditLogEntry, User } from './types'

// Mock user for demo
let mockUser: User | null = null

// Mock data store
let properties: Property[] = [
  {
    id: '1',
    owner_id: 'demo-user',
    name: 'Main Residence',
    address: '123 Oak Street, Atlanta, GA 30301',
    jurisdiction: 'Atlanta Police Department',
    mode: 'watch',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    owner_id: 'demo-user',
    name: 'Lake House',
    address: '456 Lakeside Dr, Marietta, GA 30060',
    jurisdiction: 'Cobb County Sheriff',
    mode: 'guardian',
    created_at: new Date().toISOString(),
  },
]

let cameras: Camera[] = [
  { id: 'c1', property_id: '1', name: 'Front Door', is_exterior: true },
  { id: 'c2', property_id: '1', name: 'Driveway', is_exterior: true },
  { id: 'c3', property_id: '1', name: 'Backyard', is_exterior: true },
  { id: 'c4', property_id: '1', name: 'Garage', is_exterior: true },
  { id: 'c5', property_id: '2', name: 'Dock Camera', is_exterior: true },
  { id: 'c6', property_id: '2', name: 'Front Entrance', is_exterior: true },
  { id: 'c7', property_id: '2', name: 'Side Gate', is_exterior: true },
]

let shares: Share[] = []

let auditLog: AuditLogEntry[] = [
  {
    id: 'a1',
    property_id: '1',
    event: 'property_created',
    detail: 'Property registered in Watch Mode',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a2',
    property_id: '1',
    event: 'camera_added',
    detail: 'Front Door camera added',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a3',
    property_id: '2',
    event: 'property_created',
    detail: 'Property registered in Guardian Mode',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a4',
    property_id: '2',
    event: 'mode_changed',
    detail: 'Mode changed to Guardian',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Auth functions
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (email && password.length >= 6) {
    mockUser = { id: 'demo-user', email }
    return { user: mockUser, error: null }
  }
  return { user: null, error: 'Invalid credentials' }
}



export async function signOut(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300))
  mockUser = null
}

// Property functions
export async function getProperties(): Promise<Property[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return properties.filter(p => p.owner_id === 'demo-user')
}

export async function getProperty(id: string): Promise<Property | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return properties.find(p => p.id === id && p.owner_id === 'demo-user') || null
}

export async function createProperty(data: Omit<Property, 'id' | 'owner_id' | 'created_at'>): Promise<Property> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const newProperty: Property = {
    ...data,
    id: `prop-${Date.now()}`,
    owner_id: 'demo-user',
    created_at: new Date().toISOString(),
  }
  properties.push(newProperty)
  
  // Add audit log entry
  addAuditEntry(newProperty.id, 'property_created', `Property registered in ${data.mode === 'watch' ? 'Watch' : 'Guardian'} Mode`)
  
  return newProperty
}

// Camera functions
export async function getCameras(propertyId: string): Promise<Camera[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return cameras.filter(c => c.property_id === propertyId)
}

// Share functions
export async function getActiveShare(propertyId: string): Promise<Share | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const now = new Date()
  return shares.find(s => 
    s.property_id === propertyId && 
    s.status === 'active' && 
    new Date(s.expires_at) > now
  ) || null
}

export async function createShare(propertyId: string, agency: string, cameraIds: string[]): Promise<Share> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
  
  const newShare: Share = {
    id: `share-${Date.now()}`,
    property_id: propertyId,
    agency,
    status: 'active',
    authorized_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    ended_at: null,
    ended_reason: null,
  }
  shares.push(newShare)
  
  // Add audit log entry
  addAuditEntry(
    propertyId, 
    'share_authorized', 
    `Emergency share authorized to ${agency}. ${cameraIds.length} cameras shared. Expires at ${expiresAt.toLocaleTimeString()}`
  )
  
  return newShare
}

export async function endShare(shareId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const share = shares.find(s => s.id === shareId)
  if (share) {
    share.status = 'ended'
    share.ended_at = new Date().toISOString()
    share.ended_reason = 'manual'
    
    // Add audit log entry
    addAuditEntry(share.property_id, 'share_ended', `Emergency share manually terminated by property owner`)
  }
}

// Audit log functions
export async function getAuditLog(propertyId: string): Promise<AuditLogEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return auditLog
    .filter(a => a.property_id === propertyId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

function addAuditEntry(propertyId: string, event: string, detail: string): void {
  auditLog.push({
    id: `audit-${Date.now()}`,
    property_id: propertyId,
    event,
    detail,
    created_at: new Date().toISOString(),
  })
}
