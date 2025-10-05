"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Phone, Video, Send, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const ChatPage = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const welcomeMessageAdded = useRef<boolean>(false);
  const messageIds = useRef<Set<string>>(new Set());

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Only add welcome message once
    if (!welcomeMessageAdded.current) {
      const welcomeMessageId = `welcome-${Date.now()}`;
      const welcomeMessage: Message = {
        id: welcomeMessageId,
        content: 'Welcome to ProConnectSA Support! How can I help you today?',
        sender: 'support',
        timestamp: new Date().toISOString(),
        status: 'read'
      };
      messageIds.current.add(welcomeMessageId);
      setMessages([welcomeMessage]);
      welcomeMessageAdded.current = true;
    }

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/chat/?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('Chat WebSocket connected');
          setIsConnected(true);
          wsRef.current = ws;
          
          // Send authentication
          ws.send(JSON.stringify({
            type: 'auth',
            token: token
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chat_message') {
              const messageId = data.message.id || `msg-${Date.now()}-${Math.random()}`;
              
              // Check if message already exists to prevent duplicates
              if (messageIds.current.has(messageId)) {
                console.log('Duplicate message detected, skipping:', messageId);
                return;
              }
              
              const message: Message = {
                id: messageId,
                content: data.message.content,
                sender: data.message.sender,
                timestamp: data.message.timestamp,
                status: 'read'
              };
              
              messageIds.current.add(messageId);
              setMessages(prev => [...prev, message]);
            } else if (data.type === 'typing') {
              setIsTyping(data.isTyping);
            }
          } catch (error) {
            console.error('Error parsing chat message:', error);
          }
        };

        ws.onclose = () => {
          console.log('Chat WebSocket disconnected');
          setIsConnected(false);
          wsRef.current = null;
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect chat WebSocket...');
            connectWebSocket();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.warn('Chat WebSocket error:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Error creating chat WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      // Reset welcome message flag and message IDs when component unmounts
      welcomeMessageAdded.current = false;
      messageIds.current.clear();
    };
  }, []); // Only run once on mount

  const handleSendMessage = () => {
    if (newMessage.trim() && wsRef.current && isConnected) {
      const messageId = `user-${Date.now()}-${Math.random()}`;
      
      // Check if message already exists to prevent duplicates
      if (messageIds.current.has(messageId)) {
        console.log('Duplicate message detected, skipping:', messageId);
        return;
      }
      
      const message: Message = {
        id: messageId,
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      // Add message ID to Set and message to local state
      messageIds.current.add(messageId);
      setMessages(prev => [...prev, message]);
      
      // Send message via WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: {
          id: messageId,
          content: newMessage,
          sender: 'user',
          timestamp: message.timestamp
        }
      }));
      
      setNewMessage('');
      
      // Simulate support response for demo (in real implementation, this would come from support staff)
      setTimeout(() => {
        const supportMessageId = `support-${Date.now()}-${Math.random()}`;
        
        // Check if support message already exists
        if (messageIds.current.has(supportMessageId)) {
          console.log('Duplicate support message detected, skipping:', supportMessageId);
          return;
        }
        
        const supportResponse: Message = {
          id: supportMessageId,
          content: 'Thank you for your message. Our support team will respond shortly.',
          sender: 'support',
          timestamp: new Date().toISOString(),
          status: 'read'
        };
        
        messageIds.current.add(supportMessageId);
        setMessages(prev => [...prev, supportResponse]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
              Live Chat Support
            </h1>
            <p className="text-gray-600 mt-1">Chat with our support team in real-time</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-xs text-gray-500 ml-2">Support is typing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className={`p-2 rounded-lg ${
                isConnected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!isConnected ? 'Not connected to chat server' : 'Send message'}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-medium text-gray-900">Phone Support</h3>
              <p className="text-sm text-gray-600">+27689518124</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Video className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="font-medium text-gray-900">Video Call</h3>
              <p className="text-sm text-gray-600">Schedule a video call</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <h3 className="font-medium text-gray-900">Support Ticket</h3>
              <p className="text-sm text-gray-600">Create a support ticket</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

