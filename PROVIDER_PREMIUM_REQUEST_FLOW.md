# 👤 Provider Premium Request Flow - What Providers See & Experience

## 📋 **Current Provider Experience**

### **Step 1: Provider Sees Premium Upgrade Option**

**Where Providers See It:**
1. **Dashboard Overview** (`/dashboard`)
   - Shows "Request Premium →" button if not premium
   - Shows "Manage Premium" if already premium

2. **Settings Page** (`/dashboard/settings`)
   - "Premium Listing" section
   - Shows current status
   - "Request Premium" buttons for Monthly/Lifetime

3. **Premium Upgrade Page** (`/dashboard/upgrade`)
   - Full premium plans comparison
   - Two plans: Monthly (R299) and Lifetime (R2,990)

---

### **Step 2: Provider Clicks "Request Premium Listing"**

**What Happens:**
1. Provider selects plan (Monthly or Lifetime)
2. Frontend calls: `POST /api/auth/request-premium-listing`
3. Backend creates `DepositRequest` with:
   - Status: `pending`
   - Reference: `PREMIUM{unique_id}{timestamp}` (e.g., `PREMIUMCCEF471770650820`)
   - Amount: R299 (monthly) or R2,990 (lifetime)
   - `verification_notes`: "Premium listing request - monthly plan"
   - `credits_to_activate`: 0 (premium doesn't give credits)

---

### **Step 3: Provider Sees Banking Details Modal**

**What Provider Sees:**

```
┌─────────────────────────────────────────┐
│ Complete EFT to Activate Premium       │
├─────────────────────────────────────────┤
│                                         │
│ Amount Due: R299.00                     │
│ Plan Type: monthly                      │
│                                         │
│ Banking Details:                        │
│ • Bank: Nedbank                         │
│ • Account: 1313872032                   │
│ • Branch Code: 198765                   │
│ • Account Holder: ProConnectSA (Pty) Ltd│
│                                         │
│ Payment Reference (IMPORTANT):          │
│ PREMIUMCCEF471770650820                 │
│ [Copy Button]                           │
│                                         │
│ ⚠️ Use this EXACT reference when       │
│ making the EFT payment                  │
│                                         │
│ Automatic Activation:                   │
│ Once your EFT payment is detected        │
│ (usually within 5 minutes), your        │
│ premium listing will be activated       │
│ automatically. You'll receive an email  │
│ confirmation when it's active.          │
│                                         │
│ [Got it, I'll make the payment]         │
└─────────────────────────────────────────┘
```

**Key Information Shown:**
- ✅ Exact amount to pay
- ✅ Banking details (bank, account, branch)
- ✅ **Unique reference number** (most important!)
- ✅ Copy buttons for easy copying
- ✅ Instructions to use exact reference
- ✅ Promise of auto-activation within 5 minutes
- ✅ Email confirmation promise

---

### **Step 4: Provider Makes EFT Payment**

**What Provider Does:**
1. Opens their banking app/website
2. Makes EFT payment:
   - Amount: R299 (or R2,990)
   - Reference: `PREMIUMCCEF471770650820` (exact reference from modal)
   - To: Nedbank account 1313872032

**What Provider Expects:**
- Premium activates automatically within 5 minutes
- Email confirmation when activated
- Free leads immediately available

---

### **Step 5: Payment Detection (Auto-Activation)**

**What Happens Automatically:**

1. **Bank Reconciliation Service** (runs every 5 minutes):
   - Checks bank transactions
   - Matches by reference number
   - Finds payment with `PREMIUMCCEF471770650820`

2. **Auto-Activation Process:**
   ```python
   # In reconciliation.py
   if payment detected:
       deposit.bank_reference = bank_transaction_id
       deposit.is_auto_verified = True
       deposit.status = 'completed'
       
       # Activate premium listing
       provider.is_premium_listing = True
       provider.premium_listing_started_at = now
       provider.premium_listing_expires_at = now + 30 days (monthly)
       provider.premium_listing_payment_reference = reference_number
   ```

3. **Email Sent to Provider:**
   ```
   Subject: Premium listing activated
   
   Your premium listing payment was detected and your 
   premium listing is now active.
   
   Reference: PREMIUMCCEF471770650820
   ```

4. **Provider Gets:**
   - ✅ Premium listing active
   - ✅ Free leads (0 credits)
   - ✅ Featured placement
   - ✅ Premium badge

---

### **Step 6: If Payment NOT Detected (Manual Approval)**

**Current Situation:**
- Payment may not be auto-detected (bank delays, reference mismatch, etc.)
- Deposit stays `pending`
- Provider waits... and waits...

**What Provider Sees:**
- Still shows as "pay as you go"
- No premium benefits
- No email confirmation
- **Provider doesn't know what's happening**

**What Admin Sees:**
- Premium request in admin dashboard
- Payment status: "Not Verified"
- Approve button disabled
- Can't approve until payment verified

---

## ⚠️ **Current Problems**

### **Problem 1: Provider Has No Visibility**

**What's Missing:**
- ❌ No way to check payment status
- ❌ No way to see if payment was received
- ❌ No way to know if premium is pending approval
- ❌ No status updates

**Provider Experience:**
- Makes payment
- Waits...
- Doesn't know if payment was received
- Doesn't know if premium is active
- May contact support asking "Did you get my payment?"

---

### **Problem 2: No Payment Status Check**

**What Provider Needs:**
- ✅ See if payment was detected
- ✅ See if premium is pending approval
- ✅ See if premium is active
- ✅ See expiration date

**Current State:**
- Provider can only see if premium is active (in settings)
- No way to check pending status
- No way to see payment verification status

---

## ✅ **What We Should Add for Providers**

### **Option 1: Payment Status Page**

**New Page:** `/dashboard/premium-status`

**Shows:**
- Current premium status (Active/Pending/None)
- Payment status (Verified/Pending)
- Reference number
- Amount paid
- Expiration date (if active)
- "Check Payment Status" button

---

### **Option 2: Enhanced Settings Page**

**Add to Settings:**
- Premium status section with:
  - Current status badge
  - Payment verification status
  - Reference number
  - "Check Payment Status" button
  - Expiration countdown (if active)

---

### **Option 3: Dashboard Notification**

**Show in Dashboard:**
- Banner if premium request pending
- "Payment Status: Pending Verification"
- "Check Status" button
- Auto-refresh every 30 seconds

---

## 🔧 **Recommended Implementation**

### **Phase 1: Add Payment Status Check Endpoint**

**New Endpoint:** `GET /api/auth/premium-status/`

**Returns:**
```json
{
  "has_premium_request": true,
  "premium_status": "pending", // "active", "pending", "none"
  "payment_status": "pending", // "verified", "pending", "none"
  "deposit": {
    "id": "uuid",
    "amount": 299.00,
    "reference_number": "PREMIUMCCEF471770650820",
    "bank_reference": null,
    "status": "pending",
    "created_at": "2026-02-09T17:27:00Z",
    "payment_verified": false
  },
  "premium_listing": {
    "is_active": false,
    "expires_at": null,
    "started_at": null
  }
}
```

---

### **Phase 2: Add Status Display in Settings**

**Update Settings Page:**
- Show premium request status
- Show payment verification status
- Show reference number
- Add "Check Payment Status" button
- Show countdown if active

---

### **Phase 3: Add Dashboard Notification**

**Show Banner:**
- If premium request pending
- "Your premium request is pending payment verification"
- "Check Status" button
- Auto-hide when premium active

---

## 📊 **Current Flow Summary**

### **What Provider Sees:**

1. ✅ **Request Premium** → Sees plans, clicks button
2. ✅ **Banking Details Modal** → Gets reference number, banking details
3. ✅ **Makes Payment** → Uses reference number
4. ⏳ **Waits...** → No visibility of status
5. ✅ **Email Confirmation** → Only if auto-detected
6. ✅ **Premium Active** → Only if payment detected/approved

### **What's Missing:**

- ❌ Payment status visibility
- ❌ Pending request status
- ❌ Manual status check
- ❌ Real-time updates
- ❌ Clear communication

---

## 🎯 **Next Steps**

1. **Add payment status endpoint** (backend)
2. **Add status display** (frontend settings)
3. **Add dashboard notification** (frontend dashboard)
4. **Test with real provider** (HydroVolts Solutions)

---

**Should I implement the payment status visibility for providers?** 🤔
