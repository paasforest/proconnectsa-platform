"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 10 seconds if user doesn't interact
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isVisible) {
        setIsVisible(false);
        onDismiss();
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm sm:text-base">
                New version available!
              </p>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Update now to get the latest features and improvements.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={onUpdate}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-auto"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              Update Now
            </Button>
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className="p-1.5 hover:bg-blue-700 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
