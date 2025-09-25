'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface WebSocketMessage {
  type: 'lead_claimed' | 'lead_created';
  lead_id?: string;
  current_claims?: number;
  remaining_slots?: number;
  is_available?: boolean;
  status?: string;
  lead?: any;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = (session as any)?.accessToken || (session as any)?.token;
    if (!token) return;

    // Add a small delay to prevent WebSocket from interfering with login
    const connectTimeout = setTimeout(() => {
      const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/leads/?token=${token}`;
        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setSocket(newSocket);
        };

        newSocket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            
            // Handle different message types
            switch (message.type) {
              case 'lead_claimed':
                // Handle lead claimed updates
                console.log('Lead claimed:', message.lead_id);
                break;
              case 'lead_created':
                // Handle new lead notifications
                console.log('New lead created:', message.lead);
                break;
              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        newSocket.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          setSocket(null);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 3000);
        };

        newSocket.onerror = (error) => {
          console.warn('WebSocket connection error (non-critical):', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
      }
    };

      connectWebSocket();
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(connectTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [(session as any)?.accessToken, (session as any)?.token]);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };

  return {
    socket,
    isConnected,
    sendMessage
  };
}
