'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus,
  Eye,
  Phone,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { apiClient } from '@/lib/api'

interface ClientStats {
  total_requests: number
  active_requests: number
  completed_jobs: number
  total_provider_interest: number
  providers_unlocked_contact: number
  recent_activity_week: number
  avg_response_hours: number
  success_rate: number
}

interface ClientUser {
  name: string
  email: string
  member_since: string
}

export default function ClientDashboardOverview() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (session?.accessToken) {
          apiClient.setToken(session.accessToken)
        }
        
        const response = await apiClient.get('/api/client/dashboard/')
        setStats(response.stats)
        setUser(response.user)
      } catch (error) {
        console.error('Failed to fetch client dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchDashboardData()
    }
  }, [session?.accessToken])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: stats?.total_requests || 0,
      subtitle: 'Service requests submitted',
      icon: FileText,
      color: 'blue',
      change: stats?.recent_activity_week ? `+${stats.recent_activity_week} this week` : null
    },
    {
      title: 'Active Requests',
      value: stats?.active_requests || 0,
      subtitle: 'Currently finding providers',
      icon: AlertCircle,
      color: 'orange',
      change: stats?.active_requests > 0 ? 'Receiving interest' : 'No active requests'
    },
    {
      title: 'Provider Interest',
      value: stats?.total_provider_interest || 0,
      subtitle: 'Providers interested total',
      icon: Users,
      color: 'green',
      change: `${stats?.providers_unlocked_contact || 0} unlocked contact`
    },
    {
      title: 'Success Rate',
      value: `${stats?.success_rate || 0}%`,
      subtitle: 'Jobs completed',
      icon: CheckCircle,
      color: 'purple',
      change: `${stats?.completed_jobs || 0} jobs done`
    }
  ]

  const quickActions = [
    {
      title: 'New Service Request',
      description: 'Get quotes from local providers',
      icon: Plus,
      href: '/request-quote',
      color: 'blue',
      primary: true
    },
    {
      title: 'View My Requests',
      description: 'Track your active requests',
      icon: Eye,
      href: '/client/requests',
      color: 'green'
    },
    {
      title: 'Contact Support',
      description: 'Get help with your requests',
      icon: Phone,
      href: '/client/support',
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'Client'}!
            </h1>
            <p className="text-blue-100">
              Track your service requests and connect with local providers
            </p>
            {user?.member_since && (
              <p className="text-blue-200 text-sm mt-2">
                Member since {user.member_since}
              </p>
            )}
          </div>
          <Button 
            onClick={() => router.push('/request-quote')}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  {card.change && (
                    <p className="text-xs text-gray-600 mt-2 font-medium">
                      {card.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.title} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  action.primary ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex p-3 rounded-full bg-${action.color}-100 mb-3`}>
                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.avg_response_hours}h
                </div>
                <p className="text-sm text-gray-600">Average Response Time</p>
                <p className="text-xs text-gray-500 mt-1">
                  How quickly providers show interest
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.total_provider_interest}
                </div>
                <p className="text-sm text-gray-600">Total Provider Interest</p>
                <p className="text-xs text-gray-500 mt-1">
                  Providers interested in your requests
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.success_rate}%
                </div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-xs text-gray-500 mt-1">
                  Requests that led to completed jobs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {stats && stats.active_requests === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Ready for your next project?
                </h3>
                <p className="text-gray-600 text-sm">
                  Submit a new service request and get quotes from verified local providers.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/request-quote')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


