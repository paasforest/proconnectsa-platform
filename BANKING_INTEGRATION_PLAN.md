# 🏦 Banking Integration Plan for LeadFlowDashboard

## **Current Issues in Dashboard:**

### 1. **Mock Data Usage**
```typescript
// ❌ CURRENT: Mock data
const billingData = {
  billingType: "payg" as const,
  walletBalance: 120,  // Hardcoded
  subscriptionTier: null,
};

// ❌ CURRENT: Fake payment processing
await new Promise(resolve => setTimeout(resolve, 2000));
```

### 2. **Missing Real API Integration**
- No real wallet balance fetching
- No actual deposit creation
- No deposit history integration
- No real payment processing

## **Banking Integration Points:**

### **1. Wallet Balance Integration**
**Location**: Line 147-155 in `LeadFlowDashboard.tsx`

**Current:**
```typescript
const billingData = {
  billingType: "payg" as const,
  walletBalance: 120,  // ❌ Hardcoded
  subscriptionTier: null,
};
```

**Should Be:**
```typescript
// ✅ REAL API Integration
const fetchWalletBalance = async () => {
  const response = await fetch('/api/users/profile/', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
  const userData = await response.json();
  return {
    billingType: userData.billing_type || "payg",
    walletBalance: userData.provider_profile?.credit_balance || 0,
    subscriptionTier: userData.subscription_tier
  };
};
```

### **2. Top-Up Modal Integration**
**Location**: Lines 469-485 in `processPayment()` function

**Current:**
```typescript
// ❌ FAKE: Simulated payment
await new Promise(resolve => setTimeout(resolve, 2000));
setWalletBalance(prev => prev + pkg.credits);
```

**Should Be:**
```typescript
// ✅ REAL: Create manual deposit request
const createDepositRequest = async (pkg: { credits: number; price: number }) => {
  const response = await fetch('/api/payments/manual-deposits/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
      amount: pkg.price,
      credits_to_activate: pkg.credits,
      payment_method: 'manual_deposit'
    })
  });
  
  const result = await response.json();
  
  // Show deposit instructions modal
  setDepositData({
    reference: result.deposit.reference_number,
    amount: pkg.price,
    credits: pkg.credits
  });
  setShowPaymentInstructionsModal(true);
};
```

### **3. Deposit History Integration**
**Location**: Lines 600-650 in deposit history tab

**Current:**
```typescript
// ❌ MISSING: No deposit history integration
const depositHistory = []; // Empty array
```

**Should Be:**
```typescript
// ✅ REAL: Fetch deposit history
const fetchDepositHistory = async () => {
  const response = await fetch('/api/payments/manual-deposits/', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
  });
  const deposits = await response.json();
  setDepositHistory(deposits);
};
```

### **4. Payment Instructions Modal**
**Location**: Lines 700-800 (needs to be added)

**Missing Component:**
```typescript
// ✅ NEEDED: Real deposit instructions modal
const showPaymentInstructionsModal = (depositData: {
  reference: string;
  amount: number;
  credits: number;
}) => {
  // Show modal with real bank details
  // Bank: ABSA Bank
  // Account: 4082135670
  // Branch: 632005
  // Reference: depositData.reference
};
```

## **Integration Priority:**

### **High Priority (Essential)**
1. **Real Wallet Balance** - Replace hardcoded 120 with API call
2. **Manual Deposit Creation** - Replace fake payment with real API
3. **Payment Instructions** - Show real bank details and reference

### **Medium Priority (Important)**
4. **Deposit History** - Show real deposit status and history
5. **Error Handling** - Handle API errors gracefully
6. **Loading States** - Show loading during API calls

### **Low Priority (Nice to Have)**
7. **Auto-refresh Balance** - Update balance after successful deposits
8. **Deposit Notifications** - Toast notifications for deposit status
9. **Payment Method Selection** - Multiple payment options

## **Implementation Steps:**

### **Step 1: Replace Mock Data (Lines 147-155)**
```typescript
// Replace hardcoded billing data with real API call
useEffect(() => {
  async function fetchData() {
    try {
      // Real API call instead of mock data
      const billingData = await fetchWalletBalance();
      setBillingType(billingData.billingType);
      setWalletBalance(billingData.walletBalance);
      setSubscriptionTier(billingData.subscriptionTier);
    } catch (err) {
      handleError("Failed to load wallet balance", "error");
    }
  }
  fetchData();
}, []);
```

### **Step 2: Real Payment Processing (Lines 469-485)**
```typescript
const processPayment = async (pkg: { credits: number; price: number }) => {
  setProcessingPayment(true);
  try {
    // Create real deposit request
    const result = await createDepositRequest(pkg);
    
    // Show payment instructions
    setDepositData(result);
    setShowPaymentInstructionsModal(true);
    setShowTopUpModal(false);
    
  } catch (err) {
    handleError("Failed to create deposit request", "error");
  } finally {
    setProcessingPayment(false);
  }
};
```

### **Step 3: Add Payment Instructions Modal**
```typescript
// Add new modal component for deposit instructions
const PaymentInstructionsModal = ({ depositData, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2>Bank Transfer Instructions</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>Bank: ABSA Bank</p>
          <p>Account: 4082135670</p>
          <p>Branch: 632005</p>
          <p>Reference: {depositData.reference}</p>
          <p>Amount: R{depositData.amount}</p>
        </div>
      </div>
    </Modal>
  );
};
```

## **Benefits After Integration:**

1. **Real Banking** - Users can actually deposit money
2. **Live Balance** - Shows real credit balance
3. **Deposit Tracking** - Users can track their deposits
4. **Professional UX** - Proper payment flow with instructions
5. **Error Handling** - Graceful handling of payment issues

## **Current Dashboard Status:**
- ✅ **UI/UX**: Professional, modern design
- ✅ **WebSocket**: Real-time updates working
- ✅ **Lead Flow**: Lead claiming and display working
- ❌ **Banking**: Still using mock data and fake payments
- ❌ **API Integration**: Missing real backend connections

The dashboard is **95% complete** - it just needs the banking integration to be fully functional!



