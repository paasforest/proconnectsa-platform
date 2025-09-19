'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  Download,
  Send,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Quote {
  id: string
  leadId: string
  leadTitle: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  amount: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  validUntil: Date
  estimatedDuration: string
  description: string
  terms: string
  items: QuoteItem[]
  providerName: string
  providerEmail: string
  providerPhone: string
  providerCompany?: string
}

interface QuoteDetailsProps {
  quote: Quote
  isProvider: boolean
  onEdit: () => void
  onSend: () => void
  onAccept: () => void
  onReject: () => void
  onDownload: () => void
  onClose: () => void
}

export function QuoteDetails({
  quote,
  isProvider,
  onEdit,
  onSend,
  onAccept,
  onReject,
  onDownload,
  onClose
}: QuoteDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
      case 'viewed': return <AlertCircle className="h-4 w-4" />
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'expired': return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const isExpired = new Date() > quote.validUntil
  const canEdit = quote.status === 'draft' && isProvider
  const canSend = quote.status === 'draft' && isProvider
  const canRespond = ['sent', 'viewed'].includes(quote.status) && !isProvider

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Quote Details</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(quote.status)} text-white`}>
                {getStatusIcon(quote.status)}
                <span className="ml-1">{getStatusText(quote.status)}</span>
              </Badge>
              {isExpired && quote.status !== 'accepted' && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quote Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{quote.leadTitle}</h2>
              <p className="text-gray-600 mb-4">{quote.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Created: {quote.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Valid Until: {quote.validUntil.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Duration: {quote.estimatedDuration}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                R{quote.amount.toLocaleString()}
              </div>
              <p className="text-gray-600">Total Quote Amount</p>
            </div>
          </div>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{quote.clientName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{quote.clientEmail}</span>
                  </div>
                  {quote.clientPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{quote.clientPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provider Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{quote.providerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{quote.providerEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{quote.providerPhone}</span>
                  </div>
                  {quote.providerCompany && (
                    <div className="text-sm text-gray-600">
                      {quote.providerCompany}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × R{item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R{item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">R{quote.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{quote.terms}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quote
                </Button>
              )}
              
              {canSend && (
                <Button onClick={onSend} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Quote
                </Button>
              )}
              
              {canRespond && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={onReject}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={onAccept}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Quote
                  </Button>
                </>
              )}
              
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








