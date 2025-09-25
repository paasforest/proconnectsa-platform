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
    // Prepare data in multiple formats to ensure compatibility
    const payload = {
      // Title variations
      title: data.title || data.name || data.service_name,
      name: data.title || data.name || data.service_name,
      service_name: data.title || data.name || data.service_name,
      
      // Description variations
      description: data.description || data.details,
      details: data.description || data.details,
      
      // Budget variations
      budget: data.budget || (data.budget_min && data.budget_max ? (data.budget_min + data.budget_max) / 2 : undefined),
      budget_range: data.budget_range,
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      
      // Category variations
      category: data.category || data.service_category,
      service_category: data.category || data.service_category,
      
      // Location variations
      location: data.location || data.city,
      city: data.location || data.city,
      
      // Client info
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone
    };

    console.log('Sending lead creation request:', payload);

    const response = await fetch('https://api.proconnectsa.co.za/api/leads/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Lead creation error:', error);
    throw error;
  }
};
