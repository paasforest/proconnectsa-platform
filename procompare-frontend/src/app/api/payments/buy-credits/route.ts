import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const creditPurchaseSchema = z.object({
  credits: z.number().int().positive().max(1000),
  return_url: z.string().url(),
  cancel_url: z.string().url()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Validate the request body
    const validatedData = creditPurchaseSchema.parse(body)
    
    // Forward to backend PayPal service
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'
    
    const response = await fetch(`${backendUrl}/api/payments/paypal/create-payment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization') || ''}`
      },
      body: JSON.stringify({
        credits: validatedData.credits,
        return_url: validatedData.return_url,
        cancel_url: validatedData.cancel_url
      })
    })

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({
        success: true,
        payment_id: data.payment_id,
        approval_url: data.approval_url,
        amount: data.amount,
        credits: data.credits,
        currency: 'ZAR'
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        message: data.error || 'Payment creation failed'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Credit purchase creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credit purchase data',
        errors: error.issues?.map(issue => issue.message) || ['Validation failed']
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create credit purchase'
    }, { status: 500 })
  }
}



