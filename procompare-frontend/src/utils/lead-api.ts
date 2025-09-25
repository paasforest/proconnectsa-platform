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
    // Map budget_range to budget field for API compatibility
    const budgetMap = {
      'under_1000': 500,
      '1000_5000': 3000,
      '5000_15000': 10000,
      '15000_50000': 32500,
      'over_50000': 75000,
      'no_budget': 5000,
      '0_1000': 500,
      '5000_20000': 12500,
      '20000_plus': 50000
    };

    // Prepare data in the format the API expects
    const payload = {
      // Required fields
      title: data.title || data.name || data.service_name || 'Service Request',
      description: data.description || data.details || 'Service description',
      budget: data.budget || budgetMap[data.budget_range] || 5000,
      category: data.category || data.service_category || '1',
      location: data.location || data.city || 'Cape Town',
      
      // Optional fields
      budget_range: data.budget_range,
      budget_min: data.budget_min,
      budget_max: data.budget_max,
      client_name: data.client_name || 'Anonymous Client',
      client_email: data.client_email || 'client@example.com',
      client_phone: data.client_phone || '+27123456789',
      
      // Additional fields that might be needed
      urgency: data.urgency || 'medium',
      hiring_intent: data.hiring_intent || 'ready_to_hire',
      hiring_timeline: data.hiring_timeline || 'this_month',
      source: data.source || 'website'
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
