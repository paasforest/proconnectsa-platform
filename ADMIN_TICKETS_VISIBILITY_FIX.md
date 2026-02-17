# 🔧 Fix: Admin Dashboard Not Showing Tickets

## Problem
- **Django Admin** (`/admin/`) shows tickets ✅
- **Custom Admin Dashboard** (`/admin/dashboard`) shows 0 tickets ❌

## Root Cause
The custom admin dashboard uses the REST API endpoint `/api/support/tickets/` which requires:
1. Valid authentication token
2. User with `is_staff=True` OR `user_type='admin'` or `'support'`

The admin user's token might have been created **before** permissions were fixed, so the API doesn't recognize them as admin.

## Solution Applied

### 1. Backend Changes ✅
- ✅ Fixed admin user permissions (verified: `user_type='admin'`, `is_staff=True`)
- ✅ Enhanced logging in `SupportTicketListCreateView.get_queryset()` to debug authentication
- ✅ Added check for unauthenticated users

### 2. Frontend Changes ✅
- ✅ Ensure token is set in `apiClient` before making API call
- ✅ Added comprehensive logging to debug response parsing

## How to Fix (User Action Required)

### Step 1: Log Out and Log Back In
The admin user needs to **log out and log back in** to get a fresh token with the correct permissions:

1. Go to: `https://www.proconnectsa.co.za/admin/dashboard`
2. Click "Logout" (if logged in)
3. Go to: `https://www.proconnectsa.co.za/admin`
4. Log in with:
   - Email: `admin@proconnectsa.co.za`
   - Password: `Admin123!`
5. This will create a **new token** with the correct admin permissions

### Step 2: Check Browser Console
After logging in, open the Support Tickets section and check the browser console (F12) for:
- `[Admin Support]` logs showing the API response
- Token existence and value
- Response structure and ticket count

### Step 3: Verify Backend Logs
Check the backend logs on Hetzner to see:
- Which user is authenticated
- Their `is_staff` and `user_type` values
- How many tickets are being returned

## Expected Result
After logging out and back in, the custom admin dashboard should show all 6 tickets (same as Django admin).

## Debugging
If tickets still don't appear:

1. **Check Browser Console:**
   - Look for `[Admin Support]` logs
   - Check if token exists
   - Check API response structure

2. **Check Backend Logs:**
   ```bash
   ssh root@hetzner.proconnectsa.co.za
   tail -f /opt/proconnectsa/logs/django.log | grep "SupportTicketListCreateView"
   ```

3. **Test API Directly:**
   ```bash
   # Get token from browser localStorage after login
   curl -H "Authorization: Token YOUR_TOKEN_HERE" \
     https://api.proconnectsa.co.za/api/support/tickets/
   ```

## Files Changed
- `backend/support/views.py` - Enhanced logging and authentication checks
- `procompare-frontend/src/components/admin/AdminSupportDashboard.tsx` - Ensure token is set before API call
