"use client";

import React from 'react';
import SilentErrorBoundary from './SilentErrorBoundary';
import { PushNotificationManager } from './PushNotificationManager';

/**
 * Wrapper component that safely renders PushNotificationManager
 * with silent error boundary. If push notifications fail, the app continues normally.
 */
export function PushNotificationWrapper() {
  return (
    <SilentErrorBoundary>
      <PushNotificationManager />
    </SilentErrorBoundary>
  );
}
