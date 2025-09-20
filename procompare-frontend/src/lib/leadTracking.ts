import { apiClient } from './api'

/**
 * Track when a provider views a lead for Bark-style competition stats
 * @param leadId - The ID of the lead being viewed
 * @returns Promise<boolean> - Whether the tracking was successful
 */
export const trackLeadView = async (leadId: string): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/api/leads/${leadId}/track-view/`)
    console.log('Lead view tracked:', response)
    return true
  } catch (error) {
    console.error('Failed to track lead view:', error)
    // Don't throw error - view tracking failure shouldn't break the UI
    return false
  }
}

/**
 * Track lead view with debouncing to prevent multiple calls
 * @param leadId - The ID of the lead being viewed
 * @param debounceMs - Debounce time in milliseconds (default: 1000)
 */
export const trackLeadViewDebounced = (() => {
  const trackedViews = new Set<string>()
  const debounceTimeouts = new Map<string, NodeJS.Timeout>()
  
  return (leadId: string, debounceMs: number = 1000) => {
    // Don't track if already tracked in this session
    if (trackedViews.has(leadId)) {
      return
    }
    
    // Clear existing timeout
    if (debounceTimeouts.has(leadId)) {
      clearTimeout(debounceTimeouts.get(leadId)!)
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      const success = await trackLeadView(leadId)
      if (success) {
        trackedViews.add(leadId)
      }
      debounceTimeouts.delete(leadId)
    }, debounceMs)
    
    debounceTimeouts.set(leadId, timeout)
  }
})()


