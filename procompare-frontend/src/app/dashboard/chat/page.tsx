'use client'

import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ChatPage from '@/components/dashboard/ChatPage'

function ChatPageRoute({ user }: { user: any }) {
  return (
    <DashboardLayout>
      <ChatPage />
    </DashboardLayout>
  )
}

export default withAuth(ChatPageRoute, ['provider', 'service_provider'])