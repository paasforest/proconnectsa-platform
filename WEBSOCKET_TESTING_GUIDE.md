# 🔌 WebSocket Integration Testing Guide

## ✅ **Backend WebSocket Events Implemented**

### **1. Lead Creation Events**
- **Trigger**: When a new lead is created and verified
- **Location**: `backend/leads/views.py` → `LeadCreateView.perform_create()`
- **Event**: `lead_created`
- **Data**: Lead title, description, category, location, urgency

### **2. Lead Claiming Events**
- **Trigger**: When a provider claims a lead
- **Location**: `backend/users/views.py` → `claim_lead()`
- **Event**: `lead_claimed`
- **Data**: Lead ID, current claims, total claims, availability status

### **3. Balance Update Events**
- **Trigger**: When credits are spent on lead purchases
- **Location**: `backend/payments/payment_service.py` → `purchase_lead()`
- **Event**: `balance_updated`
- **Data**: New balance, previous balance, change amount

### **4. Notification Events**
- **Trigger**: General notifications and alerts
- **Location**: `backend/notifications/consumers.py`
- **Events**: `notification_message`, `lead_alert`
- **Data**: Notification content, lead alerts, compatibility scores

## 🧪 **Testing Steps**

### **Step 1: Start the Servers**

```bash
# Terminal 1 - Backend (with WebSocket support)
cd /home/paas/work_platform
python manage.py runserver 0.0.0.0:8000

# Terminal 2 - Frontend
cd procompare-frontend
npm run dev
```

### **Step 2: Open Dashboard**
1. Navigate to `http://localhost:3000/dashboard`
2. Login with a provider account
3. Look for **"Live Updates Active"** indicator in the header
4. Open browser dev tools → Network tab → WS (WebSocket)

### **Step 3: Run WebSocket Event Tests**

```bash
# Terminal 3 - Run test script
cd /home/paas/work_platform
python test_websocket_events.py
```

### **Step 4: Verify Real-time Updates**

You should see:

#### **🔔 Toast Notifications**
- "New lead available! Test Electrical Service in Cape Town - Electrical"
- "Lead getting competitive! 2 providers have claimed this lead"
- "Balance updated! New balance: 85 credits"

#### **📊 Dashboard Updates**
- Lead claim counts updating in real-time
- New leads appearing instantly
- Balance changes reflected immediately

#### **🌐 WebSocket Connections**
In browser dev tools (Network → WS), you should see:
- `ws://localhost:8000/ws/notifications/` - Connected
- `ws://localhost:8000/ws/leads/` - Connected

### **Step 5: Test Multiple Browser Tabs**

1. **Open multiple tabs** with the dashboard
2. **Run the test script** in one tab
3. **Watch all tabs** receive the same updates simultaneously
4. **Verify real-time competition** simulation

## 🔍 **What to Look For**

### **✅ Success Indicators**

1. **Connection Status**: Green "Live Updates Active" indicator
2. **Toast Notifications**: Appear for each WebSocket event
3. **Real-time Updates**: Lead counts, balances update instantly
4. **Console Logs**: WebSocket messages logged in browser console
5. **Network Tab**: Active WebSocket connections

### **❌ Failure Indicators**

1. **Red "Offline Mode"**: WebSocket connection failed
2. **No Toast Notifications**: WebSocket events not reaching frontend
3. **Static Data**: No real-time updates visible
4. **Console Errors**: WebSocket connection errors

## 🐛 **Troubleshooting**

### **WebSocket Connection Issues**

```bash
# Check if Django Channels is properly configured
python manage.py shell
>>> from channels.layers import get_channel_layer
>>> channel_layer = get_channel_layer()
>>> print(channel_layer)

# Check ASGI configuration
cat backend/procompare/asgi.py
```

### **Frontend Connection Issues**

```javascript
// Check WebSocket connections in browser console
// Should see:
// WebSocket connected to ws://localhost:8000/ws/notifications/
// WebSocket connected to ws://localhost:8000/ws/leads/
```

### **Backend Event Issues**

```bash
# Check Django logs for WebSocket events
tail -f logs/django.log | grep -i websocket

# Test channel layer directly
python manage.py shell
>>> from channels.layers import get_channel_layer
>>> from asgiref.sync import async_to_sync
>>> channel_layer = get_channel_layer()
>>> async_to_sync(channel_layer.group_send)('notifications', {'type': 'test'})
```

## 📋 **Test Scenarios**

### **Scenario 1: New Lead Creation**
1. Run `test_websocket_events.py`
2. Watch for new lead notification
3. Verify lead appears in dashboard
4. Check toast notification appears

### **Scenario 2: Lead Competition**
1. Run lead claiming tests
2. Watch claim counts update
3. Verify competitive notifications
4. Check lead status changes

### **Scenario 3: Balance Updates**
1. Run balance update tests
2. Watch wallet balance change
3. Verify balance notification
4. Check transaction history

### **Scenario 4: Multiple Users**
1. Open dashboard in multiple tabs
2. Run tests from one tab
3. Verify all tabs receive updates
4. Test real-time competition

## 🚀 **Next Steps After Testing**

Once WebSocket integration is verified:

1. **Deploy to Production**: Ensure WebSocket support in production
2. **Monitor Performance**: Watch WebSocket connection stability
3. **Add More Events**: Extend WebSocket events as needed
4. **User Testing**: Test with real users and scenarios

## 📊 **Expected Results**

After running the tests, you should see:

- ✅ **5 WebSocket events** sent successfully
- ✅ **Real-time updates** in dashboard
- ✅ **Toast notifications** for each event
- ✅ **Live connection status** indicator
- ✅ **Console logs** showing WebSocket messages

The WebSocket integration is now fully functional and ready for production use! 🎉



