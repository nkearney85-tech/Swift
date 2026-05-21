'use client'

import { createClient } from '@/lib/supabase/client'
import { Property, Camera, Share, AuditLogEntry, User, PropertyMode } from './types'

// Auth functions
export async function signIn(
  email: string, 
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { user: null, error: error.message }
  }
  
  if (data.user) {
    return { 
      user: { id: data.user.id, email: data.user.email ?? '' }, 
      error: null 
    }
  }
  
  return { user: null, error: 'Sign in failed' }
}

export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

// Property functions
export async function getProperties(): Promise<Property[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }
  
  return data ?? []
}

export async function getProperty(id: string): Promise<Property | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching property:', error)
    return null
  }
  
  return data
}

export async function createProperty(
  data: Omit<Property, 'id' | 'owner_id' | 'created_at'>
): Promise<Property> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: newProperty, error } = await supabase
    .from('properties')
    .insert({
      owner_id: user.id,
      name: data.name,
      address: data.address,
      jurisdiction: data.jurisdiction,
      mode: data.mode,
      preroll_minutes: data.preroll_minutes ?? 15,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating property:', error)
    throw new Error(error.message)
  }
  
  // Add audit log entry
  await addAuditEntry(
    newProperty.id, 
    null,
    'property_created', 
    `Property registered in ${data.mode === 'watch' ? 'Watch' : 'Guardian'} Mode`,
    user.id
  )
  
  return newProperty
}

// Camera functions
export async function getCameras(propertyId: string): Promise<Camera[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('property_id', propertyId)
    .order('name')
  
  if (error) {
    console.error('Error fetching cameras:', error)
    return []
  }
  
  return data ?? []
}

// Share functions
export async function getActiveShare(propertyId: string): Promise<Share | null> {
  const supabase = createClient()
  
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'active')
    .gt('expires_at', now)
    .order('authorized_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching active share:', error)
    return null
  }
  
  return data
}

export async function createShare(
  propertyId: string, 
  agency: string, 
  cameraIds: string[]
): Promise<Share> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
  
  // Create the share
  const { data: newShare, error: shareError } = await supabase
    .from('shares')
    .insert({
      property_id: propertyId,
      authorized_by: user.id,
      agency,
      status: 'active',
      share_kind: 'emergency',
      preroll_minutes: 15,
      authorized_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()
  
  if (shareError) {
    console.error('Error creating share:', shareError)
    throw new Error(shareError.message)
  }
  
  // Insert share_cameras entries
  if (cameraIds.length > 0) {
    const shareCameras = cameraIds.map(cameraId => ({
      share_id: newShare.id,
      camera_id: cameraId,
    }))
    
    const { error: camerasError } = await supabase
      .from('share_cameras')
      .insert(shareCameras)
    
    if (camerasError) {
      console.error('Error linking cameras to share:', camerasError)
    }
  }
  
  // Add audit log entry
  await addAuditEntry(
    propertyId,
    newShare.id,
    'share_authorized',
    `Emergency share authorized to ${agency}. ${cameraIds.length} cameras shared. Expires at ${expiresAt.toLocaleTimeString()}`,
    user.id
  )
  
  return newShare
}

export async function endShare(shareId: string): Promise<void> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Get the share first to get property_id
  const { data: share, error: fetchError } = await supabase
    .from('shares')
    .select('property_id')
    .eq('id', shareId)
    .single()
  
  if (fetchError || !share) {
    console.error('Error fetching share:', fetchError)
    throw new Error('Share not found')
  }
  
  // Update the share
  const { error: updateError } = await supabase
    .from('shares')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString(),
      ended_reason: 'manual',
    })
    .eq('id', shareId)
  
  if (updateError) {
    console.error('Error ending share:', updateError)
    throw new Error(updateError.message)
  }
  
  // Add audit log entry
  await addAuditEntry(
    share.property_id,
    shareId,
    'share_ended',
    'Emergency share manually terminated by property owner',
    user.id
  )
}

// Audit log functions
export async function getAuditLog(propertyId: string): Promise<AuditLogEntry[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching audit log:', error)
    return []
  }
  
  return data ?? []
}

async function addAuditEntry(
  propertyId: string, 
  shareId: string | null,
  event: string, 
  detail: string,
  actor: string
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('audit_log')
    .insert({
      property_id: propertyId,
      share_id: shareId,
      event,
      detail,
      actor,
    })
  
  if (error) {
    console.error('Error adding audit entry:', error)
  }
}
