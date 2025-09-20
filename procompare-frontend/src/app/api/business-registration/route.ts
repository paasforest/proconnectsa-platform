import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let registrationData = null
  
  try {
    const data = await request.json()
    registrationData = data
    
    // Enhanced logging
    console.log('📝 Business Registration Request:', {
      timestamp: new Date().toISOString(),
      businessName: data.business_name,
      ownerName: `${data.first_name} ${data.last_name}`,
      email: data.email,
      phone: data.phone,
      businessType: data.business_type,
      urgency: data.registration_urgency,
      websiteRequired: data.website_required,
      directorsCount: data.directors?.length || 0,
      requestId: `REQ_${Date.now()}`
    })

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'business_name']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Send to Django backend with retry logic
    let backendResponse
    let attempt = 0
    const maxAttempts = 3
    
    while (attempt < maxAttempts) {
      try {
        attempt++
        console.log(`🔄 Attempt ${attempt}/${maxAttempts} - Sending to Django backend...`)
        
        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/business/registrations/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': `REQ_${Date.now()}`,
          },
          body: JSON.stringify(data),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId) // Clear timeout if request succeeds
        
        break // Success, exit retry loop
        
      } catch (fetchError) {
        console.error(`❌ Attempt ${attempt} failed:`, fetchError)
        
        if (attempt === maxAttempts) {
          throw new Error(`Backend connection failed after ${maxAttempts} attempts: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`)
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      console.error('🚨 Backend error response:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      })
      
      throw new Error(`Backend error (${backendResponse.status}): ${errorData.message || 'Unknown backend error'}`)
    }

    const responseData = await backendResponse.json()
    const processingTime = Date.now() - startTime
    
    console.log('✅ Registration successful:', {
      registrationId: responseData.registration_id,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    })

    // Return success response
    return NextResponse.json({
      success: true,
      ...responseData,
      processingTime
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    const errorId = `ERR_${Date.now()}`
    
    console.error('❌ Business registration error:', {
      errorId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString(),
      requestData: registrationData ? {
        businessName: registrationData.business_name,
        email: registrationData.email,
        phone: registrationData.phone
      } : null
    })
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit business registration',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
