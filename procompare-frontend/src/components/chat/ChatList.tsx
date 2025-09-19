'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Video, 
  MoreVertical,
  Filter,
  Plus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Chat {
  id: string
  leadId: string
  clientName: string
  clientAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  leadTitle: string
  leadBudget: number
  leadStatus: 'active' | 'quoted' | 'accepted' | 'completed'
}

interface ChatListProps {
  chats: Chat[]
  activeChatId?: string
  onSelectChat: (chatId: string) => void
  onStartNewChat: () => void
  isProvider: boolean
  isPremium: boolean
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onStartNewChat,
  isProvider,
  isPremium
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'quoted' | 'accepted' | 'completed'>('all')

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.leadTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || chat.leadStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: Chat['leadStatus']) => {
    switch (status) {
      case 'active': return 'bg-blue-500'
      case 'quoted': return 'bg-yellow-500'
      case 'accepted': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: Chat['leadStatus']) => {
    switch (status) {
      case 'active': return 'Active'
      case 'quoted': return 'Quoted'
      case 'accepted': return 'Accepted'
      case 'completed': return 'Completed'
      default: return 'Unknown'
    }
  }

  if (!isPremium && isProvider) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Chats</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Chats</span>
          </CardTitle>
          <Button size="sm" onClick={onStartNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            {(['all', 'active', 'quoted', 'accepted', 'completed'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : getStatusText(status)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No chats found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                  activeChatId === chat.id 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'border-transparent'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.clientAvatar} />
                      <AvatarFallback>{chat.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate">{chat.clientName}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(chat.lastMessageTime, { addSuffix: true })}
                        </span>
                        {chat.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 truncate">{chat.leadTitle}</p>
                      <Badge 
                        className={`text-xs ${getStatusColor(chat.leadStatus)} text-white`}
                      >
                        {getStatusText(chat.leadStatus)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-semibold text-green-600">
                          R{chat.leadBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}








