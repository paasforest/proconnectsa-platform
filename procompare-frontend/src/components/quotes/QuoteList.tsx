'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  Calendar,
  DollarSign
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Quote {
  id: string
  leadId: string
  leadTitle: string
  clientName: string
  clientEmail: string
  amount: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  validUntil: Date
  estimatedDuration: string
  description: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

interface QuoteListProps {
  quotes: Quote[]
  onViewQuote: (quoteId: string) => void
  onEditQuote: (quoteId: string) => void
  onDeleteQuote: (quoteId: string) => void
  onResendQuote: (quoteId: string) => void
  onDownloadQuote: (quoteId: string) => void
  isProvider: boolean
}

export function QuoteList({
  quotes,
  onViewQuote,
  onEditQuote,
  onDeleteQuote,
  onResendQuote,
  onDownloadQuote,
  isProvider
}: QuoteListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Quote['status']>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedQuotes = quotes
    .filter(quote => {
      const matchesSearch = 
        quote.leadTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'sent': return 'bg-blue-500'
      case 'viewed': return 'bg-yellow-500'
      case 'accepted': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'expired': return 'bg-gray-400'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'sent': return 'Sent'
      case 'viewed': return 'Viewed'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Rejected'
      case 'expired': return 'Expired'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'viewed': return <Eye className="h-4 w-4" />
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'expired': return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const isExpired = (validUntil: Date) => {
    return new Date() > validUntil
  }

  const getTotalStats = () => {
    const total = quotes.length
    const accepted = quotes.filter(q => q.status === 'accepted').length
    const pending = quotes.filter(q => ['sent', 'viewed'].includes(q.status)).length
    const totalValue = quotes
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + q.amount, 0)
    
    return { total, accepted, pending, totalValue }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Quotes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">R{stats.totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Quote Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quotes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote List */}
      <div className="space-y-4">
        {filteredAndSortedQuotes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No quotes found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{quote.leadTitle}</h3>
                      <Badge className={`${getStatusColor(quote.status)} text-white`}>
                        {getStatusIcon(quote.status)}
                        <span className="ml-1">{getStatusText(quote.status)}</span>
                      </Badge>
                      {isExpired(quote.validUntil) && quote.status !== 'accepted' && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        R{quote.amount.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDistanceToNow(quote.createdAt, { addSuffix: true })}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {quote.estimatedDuration}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">{quote.description}</p>
                    
                    <div className="text-sm text-gray-500">
                      <p><strong>Client:</strong> {quote.clientName} ({quote.clientEmail})</p>
                      <p><strong>Valid Until:</strong> {quote.validUntil.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewQuote(quote.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {quote.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditQuote(quote.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {['sent', 'viewed'].includes(quote.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResendQuote(quote.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadQuote(quote.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {quote.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteQuote(quote.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Quote Items Preview */}
                {quote.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Quote Items:</h4>
                    <div className="space-y-1">
                      {quote.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.description}
                          </span>
                          <span className="font-medium">R{item.total.toFixed(2)}</span>
                        </div>
                      ))}
                      {quote.items.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{quote.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}








