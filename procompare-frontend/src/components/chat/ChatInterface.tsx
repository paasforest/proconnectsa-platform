'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  sender: 'provider' | 'client'
  senderName: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read'
  type: 'text' | 'image' | 'file'
  fileUrl?: string
}

interface ChatInterfaceProps {
  leadId: string
  clientName: string
  clientAvatar?: string
  isProvider: boolean
  isPremium: boolean
  onSendMessage: (message: string) => void
  onSendFile: (file: File) => void
  onStartCall: () => void
  onStartVideo: () => void
}

export function ChatInterface({
  leadId,
  clientName,
  clientAvatar,
  isProvider,
  isPremium,
  onSendMessage,
  onSendFile,
  onStartCall,
  onStartVideo
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hi! I saw your lead for kitchen renovation. I\'d love to help you with this project.',
        sender: 'provider',
        senderName: 'John Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'read',
        type: 'text'
      },
      {
        id: '2',
        content: 'Great! I\'m looking for someone reliable. What\'s your experience with kitchen renovations?',
        sender: 'client',
        senderName: clientName,
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
        status: 'read',
        type: 'text'
      },
      {
        id: '3',
        content: 'I\'ve completed over 50 kitchen renovations in Cape Town. I can send you some photos of my recent work.',
        sender: 'provider',
        senderName: 'John Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        status: 'read',
        type: 'text'
      },
      {
        id: '4',
        content: 'That would be perfect! When can you come for a site visit?',
        sender: 'client',
        senderName: clientName,
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        status: 'read',
        type: 'text'
      }
    ]
    setMessages(mockMessages)
  }, [clientName])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: isProvider ? 'provider' : 'client',
        senderName: isProvider ? 'You' : clientName,
        timestamp: new Date(),
        status: 'sending',
        type: 'text'
      }
      
      setMessages(prev => [...prev, message])
      onSendMessage(newMessage)
      setNewMessage('')
      
      // Simulate message being sent
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        )
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendFile(file)
    }
  }

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  if (!isPremium && isProvider) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardContent className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
            <p className="text-gray-600 mb-4">
              In-app chat is only available for premium subscribers.
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={clientAvatar} />
              <AvatarFallback>{clientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{clientName}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isPremium && (
              <>
                <Button size="sm" variant="outline" onClick={onStartCall}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onStartVideo}>
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.sender === 'provider' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender === 'client' ? clientAvatar : undefined} />
                <AvatarFallback>
                  {message.sender === 'client' ? clientName.charAt(0) : 'Y'}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${message.sender === 'provider' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender === 'provider'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'provider' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </span>
                  {message.sender === 'provider' && getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{clientName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button size="sm" variant="ghost">
            <Smile className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}








