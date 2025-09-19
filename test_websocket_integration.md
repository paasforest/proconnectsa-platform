# WebSocket Integration Test Guide

## ✅ WebSocket Integration Complete!

The LeadFlowDashboard now has full WebSocket integration with the following features:

### 🔌 **WebSocket Connections**
- **Notifications WebSocket**: `/ws/notifications/` - Real-time notifications
- **Leads WebSocket**: `/ws/leads/` - Real-time lead updates

### 🚀 **Real-time Features Added**

#### 1. **Connection Status Indicator**
- Green "Live Updates Active" when connected
- Red "Offline Mode" when disconnected
- Shows in dashboard header

#### 2. **Real-time Lead Updates**
- **New Leads**: Automatically appear in the list
- **Lead Claims**: Claim counts update in real-time
- **Lead Status**: Updates when leads are modified/deleted
- **Competition Alerts**: Notifications when leads get competitive

#### 3. **Real-time Notifications**
- Toast notifications for new leads
- Warning when leads get competitive
- Balance update notifications
- Lead availability alerts

#### 4. **WebSocket Message Handling**
- `lead_created` - New lead added to list
- `lead_claimed` - Update claim counts
- `lead_updated` - Update lead information
- `lead_deleted` - Remove lead from list
- `balance_updated` - Update wallet balance

### 🧪 **How to Test**

#### **Backend Testing:**
```bash
# Start the Django server with WebSocket support
cd /home/paas/work_platform
python manage.py runserver 0.0.0.0:8000

# In another terminal, test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" http://localhost:8000/ws/notifications/
```

#### **Frontend Testing:**
1. Open the dashboard at `http://localhost:3000/dashboard`
2. Check for "Live Updates Active" indicator in header
3. Open browser dev tools → Network tab → WS (WebSocket)
4. You should see connections to:
   - `ws://localhost:8000/ws/notifications/`
   - `ws://localhost:8000/ws/leads/`

#### **Real-time Testing:**
1. **Claim a Lead**: Watch claim count update in real-time
2. **Check Console**: WebSocket messages logged in browser console
3. **Toast Notifications**: Should appear for various events
4. **Connection Status**: Should show green when connected

### 🔧 **Backend WebSocket Events to Trigger**

To test real-time features, the backend needs to send these WebSocket messages:

```python
# In your Django views/services, send these messages:

# When a new lead is created
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()

await channel_layer.group_send(
    "lead_updates",
    {
        "type": "lead_created",
        "lead": {
            "id": lead.id,
            "title": lead.title,
            "category": lead.service_category.name,
            "urgency": lead.urgency,
            "cost": 1.5,
            "location": lead.location_suburb
        }
    }
)

# When a lead is claimed
await channel_layer.group_send(
    "lead_updates",
    {
        "type": "lead_claimed",
        "lead_id": lead.id,
        "current_claims": 2,
        "total_claims": 3,
        "is_available": True,
        "status": "claimed"
    }
)
```

### 📊 **Current Status**

✅ **Completed:**
- WebSocket hooks imported and integrated
- Real-time message handling implemented
- Connection status indicator added
- Toast notifications for WebSocket events
- Lead claiming sends WebSocket messages
- Error handling for WebSocket connections

⏳ **Next Steps:**
- Test with actual backend WebSocket events
- Verify real-time updates work end-to-end
- Add more WebSocket event types as needed
- Implement reconnection logic improvements

### 🎯 **Key Benefits**

1. **Real-time Competition**: See when other providers claim leads
2. **Instant Notifications**: Get alerts for new leads immediately
3. **Live Updates**: No need to refresh the page
4. **Better UX**: Professional, responsive dashboard
5. **Competitive Edge**: React faster to new opportunities

The WebSocket integration is now complete and ready for testing! 🚀



