# 📋 Premium Request Workflow Guide

## 🎯 **Current Situation**

You have **12 pending premium deposits**:
- Terzen plumbing: R2990 (14.7h ago) - Lifetime plan
- ronie electrical: R299 (19.6h ago) - Monthly plan
- ronie electrical: R299 (95.7h ago) - Monthly plan
- ronie electrical: R299 (175.2h ago) - Monthly plan
- HydroVolts Solutions: R299 (200.7h ago) - Monthly plan
- +7 more deposits

---

## 🔄 **Premium Request Workflow**

### **Step 1: Provider Requests Premium**
1. Provider goes to Settings → Premium Listing
2. Selects plan (Monthly R299 or Lifetime R2990)
3. System creates `DepositRequest` with:
   - Reference number (e.g., `PREMIUM20EEB41771327809`)
   - Amount (R299 or R2990)
   - Status: `PENDING`
   - Verification notes: "Premium listing request - [plan] plan"

### **Step 2: Provider Makes Payment**
1. Provider receives payment details:
   - Bank: Nedbank
   - Account: 1313872032
   - Branch: 198765
   - Reference: `PREMIUM20EEB41771327809` (must use EXACT reference)
2. Provider makes EFT payment using the reference

### **Step 3: Payment Detection**
**Two ways payment can be detected:**

#### **A. Auto-Detection (Preferred)**
- System checks bank transactions every 5 minutes
- If payment found with matching reference → Auto-verified
- `is_auto_verified = True`
- `bank_reference` set to bank transaction ID
- Status changes to `COMPLETED`

#### **B. Manual Verification (If auto-detection fails)**
- Admin checks bank statement manually
- Admin sets `bank_reference` in deposit record
- Admin can then approve

### **Step 4: Admin Approval**
1. Go to **Premium Requests** section in admin dashboard
2. Check payment status:
   - ✅ **Verified** (green) = Payment detected, safe to approve
   - ⚠️ **Pending** (yellow) = Payment not detected yet
3. If verified → Click "Approve & Activate Premium"
4. If pending → Wait for payment OR manually verify first

### **Step 5: Premium Activation**
When approved:
- ✅ Provider's `is_premium_listing` = `True`
- ✅ `premium_listing_started_at` = now
- ✅ For monthly: `premium_listing_expires_at` = now + 30 days
- ✅ For lifetime: `premium_listing_expires_at` = `None` (never expires)
- ✅ Provider gets **unlimited FREE leads** (no credit deductions)
- ✅ Email sent to provider confirming activation

---

## 🔍 **What to Do Now**

### **Option 1: Check Payment Status (Recommended)**

1. **Go to Premium Requests section** in admin dashboard
2. **For each pending request:**
   - Check "Payment Status" badge
   - If **Verified** → Safe to approve
   - If **Pending** → Need to verify payment

### **Option 2: Verify Payments Manually**

For requests showing "Pending" payment status:

1. **Check your bank statement** for:
   - Amount: R299 or R2990
   - Reference: The `PREMIUM...` reference number
   - Date: Should match request date

2. **If payment found:**
   - Go to deposit detail modal
   - Set `bank_reference` to the bank transaction ID
   - Mark as verified
   - Then approve

3. **If payment NOT found:**
   - Contact provider to confirm payment
   - Wait for payment to clear
   - Or reject if payment not made

### **Option 3: Approve Verified Requests**

For requests with **"Payment Status: Verified"**:

1. Click on the request
2. Review details:
   - Provider name
   - Amount
   - Plan type
   - Payment reference
3. Click **"Approve & Activate Premium"**
4. Premium activates immediately

---

## ⚠️ **Important Notes**

### **Payment Verification Rules:**
- ✅ **Verified** = `bank_reference` exists AND different from `reference_number` OR `is_auto_verified = True`
- ⚠️ **Pending** = No `bank_reference` or `bank_reference` equals `reference_number` (incorrectly set)

### **Why Some Are Pending:**
1. **Payment not made yet** - Provider hasn't paid
2. **Payment made but not detected** - Auto-detection failed (check bank statement)
3. **Payment cleared but reference mismatch** - Provider used wrong reference

### **What Happens If You Approve Without Payment:**
- ❌ Provider gets premium without paying
- ❌ You lose revenue
- ✅ System prevents this - "Approve" button is disabled if payment not verified

---

## 📊 **Current Requests Analysis**

### **Terzen plumbing (R2990, 14.7h ago)**
- **Lifetime plan** - One-time payment
- **Status:** Pending
- **Action:** Check if payment received, then approve if verified

### **ronie electrical (Multiple R299 requests)**
- **Monthly plans** - Recurring payments
- **Status:** Pending
- **Action:** Check if payments received, approve verified ones

### **HydroVolts Solutions (R299, 200.7h ago)**
- **Monthly plan** - Very old request (8+ days)
- **Status:** Pending
- **Action:** Check if payment was ever made, contact provider if needed

---

## 🎯 **Recommended Actions**

### **Immediate:**
1. ✅ Go to **Premium Requests** section
2. ✅ Check payment status for each request
3. ✅ Approve requests with **"Verified"** payment status
4. ✅ For **"Pending"** requests, check bank statement

### **Short-term:**
1. Contact providers with very old pending requests (e.g., HydroVolts - 200h ago)
2. Verify if they made payment
3. If yes → Verify manually and approve
4. If no → Reject or wait for payment

### **Long-term:**
1. Monitor auto-detection system
2. If auto-detection fails frequently → Investigate bank integration
3. Set up alerts for pending requests >24h
4. Consider requiring payment before allowing premium request

---

## 🔧 **How to Access Premium Requests**

1. **Admin Dashboard** → **Premium Requests** section
2. Or direct URL: `/admin/premium-requests`
3. Filter by status: Pending, Completed, All

---

## ✅ **Summary**

**Current Status:**
- ✅ System is working correctly
- ✅ Payment verification prevents unauthorized approvals
- ⚠️ 12 pending requests need attention

**Next Steps:**
1. Check Premium Requests section
2. Verify payments for pending requests
3. Approve verified requests
4. Contact providers for unverified old requests

**The system protects you** - you can't approve without payment verification! 🛡️
