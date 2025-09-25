'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, getUserFromStorage, getTokenFromStorage, clearAuth } from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = getUserFromStorage();
    const savedToken = getTokenFromStorage();
    
    setUser(savedUser);
    setToken(savedToken);
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Higher-order component to protect your existing dashboard routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedUserTypes?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        console.log('🔍 withAuth DEBUG - User:', user);
        console.log('🔍 withAuth DEBUG - Allowed user types:', allowedUserTypes);
        console.log('🔍 withAuth DEBUG - Current path:', window.location.pathname);
        
        if (!user) {
          // Not logged in, redirect to login
          console.log('🔍 withAuth DEBUG - No user, redirecting to login');
          router.push('/login');
          return;
        }

        if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
          // Wrong user type, redirect to appropriate dashboard
          const correctDashboard = user.user_type === 'admin' ? '/admin/dashboard'
            : user.user_type === 'client' ? '/client'
            : '/provider-dashboard';
          console.log('🔍 withAuth DEBUG - Wrong user type, redirecting to:', correctDashboard);
          router.push(correctDashboard);
          return;
        }
        
        console.log('🔍 withAuth DEBUG - User type matches, rendering component');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect to login
    }

    if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
      return null; // Will redirect to correct dashboard
    }

    // Pass user data as props to your existing components
    return <WrappedComponent {...props} user={user} />;
  };
}
