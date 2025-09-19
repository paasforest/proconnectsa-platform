import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { userStore } from '@/lib/user-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const paymentId = searchParams.get('PayerID')
    const subscriptionId = searchParams.get('subscription_id')
    
    // Get current session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login?error=session_required', request.url))
    }
    
    // Verify PayPal payment (mock implementation)
    // In real implementation:
    // 1. Verify payment with PayPal API
    // 2. Confirm subscription status
    // 3. Update user subscription in database
    
    if (!token || !paymentId) {
      return NextResponse.redirect(new URL('/provider?error=payment_failed', request.url))
    }
    
    // Get pending subscription from query params or session
    const tier = searchParams.get('tier') || 'advanced'
    const amount = searchParams.get('amount') || '650'
    
    console.log('Processing PayPal callback:', {
      user: session.user.email,
      tier,
      amount,
      token,
      paymentId
    })
    
    // Update user subscription (mock)
    const user = userStore.findByEmail(session.user.email)
    if (user) {
      // Update subscription tier
      user.subscription_tier = tier as 'basic' | 'advanced' | 'pro' | 'enterprise'
      console.log(`Updated ${session.user.email} to ${tier} subscription`)
    }
    
    // Determine redirect URL based on new subscription tier
    const dashboardRoute = userStore.getDashboardRoute({
      ...session.user,
      subscription_tier: tier as 'basic' | 'advanced' | 'pro' | 'enterprise'
    } as any)
    
    // Redirect to appropriate dashboard with success message
    const redirectUrl = new URL(dashboardRoute, request.url)
    redirectUrl.searchParams.set('subscription', 'success')
    redirectUrl.searchParams.set('tier', tier)
    
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('PayPal callback error:', error)
    return NextResponse.redirect(new URL('/provider?error=callback_failed', request.url))
  }
}

export async function POST(request: NextRequest) {
  // Handle PayPal webhook notifications
  try {
    const body = await request.json()
    
    console.log('PayPal webhook received:', body.event_type)
    
    // Process different webhook events
    switch (body.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        console.log('Subscription created:', body.resource.id)
        break
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('Subscription activated:', body.resource.id)
        break
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.log('Subscription cancelled:', body.resource.id)
        break
      default:
        console.log('Unhandled webhook event:', body.event_type)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}







