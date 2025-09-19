'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Gift,
  Zap,
  Star,
  AlertCircle
} from 'lucide-react'

interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | 'bonus' | 'refund'
  amount: number
  description: string
  date: Date
  status: 'completed' | 'pending' | 'failed'
}

interface CreditBalanceProps {
  currentCredits: number
  transactions: CreditTransaction[]
  onBuyCredits: () => void
  onViewHistory: () => void
}

export function CreditBalance({ 
  currentCredits, 
  transactions, 
  onBuyCredits, 
  onViewHistory 
}: CreditBalanceProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Coins className="h-4 w-4 text-green-600" />
      case 'usage':
        return <Zap className="h-4 w-4 text-blue-600" />
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600'
      case 'usage':
        return 'text-blue-600'
      case 'bonus':
        return 'text-purple-600'
      case 'refund':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-500 text-white">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const recentTransactions = transactions.slice(0, 5)
  const totalPurchased = transactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalUsed = transactions
    .filter(t => t.type === 'usage' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const getCreditStatus = () => {
    if (currentCredits > 100) return { status: 'high', color: 'text-green-600', message: 'Good balance' }
    if (currentCredits > 50) return { status: 'medium', color: 'text-yellow-600', message: 'Running low' }
    return { status: 'low', color: 'text-red-600', message: 'Low balance' }
  }

  const creditStatus = getCreditStatus()

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span>Credit Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-900">
                {currentCredits}
              </div>
              <div className={`text-sm font-medium ${creditStatus.color}`}>
                {creditStatus.message}
              </div>
            </div>
            <div className="text-right">
              <Button 
                onClick={onBuyCredits}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Coins className="h-4 w-4 mr-2" />
                Buy Credits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalPurchased}</div>
            <div className="text-sm text-gray-600">Credits Purchased</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalUsed}</div>
            <div className="text-sm text-gray-600">Credits Used</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((currentCredits / (totalPurchased || 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Balance Warning */}
      {currentCredits < 50 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Low Credit Balance</h3>
                <p className="text-sm text-red-700">
                  You have {currentCredits} credits remaining. Consider purchasing more credits to continue using premium features.
                </p>
                <Button 
                  size="sm" 
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  onClick={onBuyCredits}
                >
                  Buy Credits Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onViewHistory}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'usage' ? '-' : '+'}{Math.abs(transaction.amount)}
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Credit Usage Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">How Credits Work</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1 credit = 1 lead contact</li>
                <li>• 1 credit = 1 premium message</li>
                <li>• 1 credit = 1 advanced search</li>
                <li>• Credits never expire</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Save Credits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use filters to find relevant leads</li>
                <li>• Read lead details before contacting</li>
                <li>• Use bulk actions when possible</li>
                <li>• Buy larger packages for better value</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}







