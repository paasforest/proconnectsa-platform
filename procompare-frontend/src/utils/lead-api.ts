// src/utils/lead-api.ts - Unified lead creation function
export interface LeadCreationData {
  title?: string;
  name?: string;
  service_name?: string;
  description?: string;
  details?: string;
  budget?: number;
  budget_range?: string;
  budget_min?: number;
  budget_max?: number;
  category?: string;
  service_category?: string;
  location?: string;
  city?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
}

export const createLead = async (data: LeadCreationData) => {
  try {
    // Import API client
    const { apiClient } = await import('@/lib/api-simple');
    
    // Map data to Django backend format
    const payload = {
      service_category_id: 1, // Default to cleaning
      title: data.title || data.name || data.service_name || 'Service Request',
      description: data.description || data.details || 'Service description',
      location_address: data.location || data.city || 'Cape Town',
      location_suburb: 'Suburb not specified',
      location_city: data.location || data.city || 'Cape Town',
      budget_range: data.budget_range || '1000_5000',
      urgency: data.urgency || 'flexible',
      preferred_contact_time: 'morning',
      additional_requirements: '',
      hiring_intent: 'ready_to_hire',
      hiring_timeline: 'asap',
      research_purpose: '',
      source: 'website',
      client_name: data.client_name || data.contact_name || 'Anonymous Client',
      client_email: data.client_email || data.contact_email || 'client@example.com',
      client_phone: data.client_phone || data.contact_phone || '+27123456789'
    };

    console.log('Sending lead creation request:', payload);

    // Use API client to call Django backend directly
    const result = await apiClient.createPublicLead(payload);
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Lead creation error:', error);
    return { 
      success: false, 
      message: error.response?.data?.error || error.message || 'Failed to create lead' 
    };
  }
};
