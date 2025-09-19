# 💰 DEPOSIT EDGE CASES ANALYSIS

## 🚨 CRITICAL EDGE CASES IN PRACTICE

### 1. **WRONG AMOUNT DEPOSITED**

#### Current System Behavior:
- ✅ **Minimum validation**: R50 minimum (in serializer)
- ❌ **No maximum validation**: Users can deposit any amount
- ❌ **No amount matching**: System doesn't verify if deposited amount matches requested amount
- ✅ **Flexible credit calculation**: Credits calculated based on actual deposited amount

#### Real-World Scenarios:
```
Scenario A: User requests R400 (5 credits) but deposits R350
- Current: Gets 4 credits (R350 ÷ R80 = 4.375 → 4 credits)
- Problem: User expected 5 credits

Scenario B: User requests R400 but deposits R500  
- Current: Gets 6 credits (R500 ÷ R80 = 6.25 → 6 credits)
- Problem: User gets more than expected, but that's actually good

Scenario C: User deposits R30 (below minimum)
- Current: Validation error, deposit rejected
- Problem: User loses money, no recovery mechanism
```

### 2. **WRONG REFERENCE NUMBER**

#### Current System Behavior:
- ❌ **No reference validation**: System doesn't verify reference numbers
- ❌ **No reference matching**: No check if reference matches any pending deposits
- ✅ **Customer code lookup**: Finds provider by customer code only

#### Real-World Scenarios:
```
Scenario A: User uses wrong reference "PC123456" instead of "PC123457"
- Current: Deposit processed normally if customer code is correct
- Problem: Reference tracking becomes meaningless

Scenario B: User forgets to include reference entirely
- Current: Deposit still processed if customer code is correct
- Problem: No audit trail for bank reconciliation

Scenario C: User uses someone else's reference
- Current: Deposit goes to wrong account if customer code is wrong
- Problem: Security issue, money goes to wrong person
```

### 3. **SHORT AMOUNTS (PARTIAL DEPOSITS)**

#### Current System Behavior:
- ✅ **Flexible system**: Credits calculated based on actual amount
- ❌ **No partial deposit handling**: No mechanism to handle "I'll deposit the rest later"
- ❌ **No remainder tracking**: No way to track partial payments

#### Real-World Scenarios:
```
Scenario A: User wants R1000 worth of credits but only has R600 now
- Current: Gets 7 credits (R600 ÷ R80 = 7.5 → 7 credits)
- Problem: No way to "top up" to reach R1000

Scenario B: User deposits R400, then later deposits R200 more
- Current: Two separate transactions, two separate credit activations
- Problem: No way to link them as "completing the same purchase"
```

## 🛠️ PROPOSED SOLUTIONS

### **SOLUTION 1: SMART DEPOSIT MATCHING SYSTEM**

```python
class SmartDepositMatcher:
    """Intelligent deposit matching and validation"""
    
    def process_deposit(self, customer_code, amount, reference_number=None):
        """Process deposit with smart matching"""
        
        # 1. Find provider
        provider = self.find_provider_by_customer_code(customer_code)
        
        # 2. Check for pending deposits
        pending_deposits = self.find_pending_deposits(provider, amount, reference_number)
        
        # 3. Match deposit to best candidate
        match_result = self.match_deposit_to_request(
            amount, reference_number, pending_deposits
        )
        
        # 4. Handle different scenarios
        return self.handle_deposit_scenario(match_result)
    
    def match_deposit_to_request(self, amount, reference, pending_deposits):
        """Match deposit to pending request"""
        
        # Exact match by reference
        if reference:
            exact_match = pending_deposits.filter(reference_number=reference).first()
            if exact_match:
                return {
                    'type': 'exact_reference_match',
                    'deposit_request': exact_match,
                    'amount_difference': amount - float(exact_match.amount),
                    'confidence': 1.0
                }
        
        # Amount-based matching (within 10% tolerance)
        for deposit_request in pending_deposits:
            amount_diff_percent = abs(amount - float(deposit_request.amount)) / float(deposit_request.amount)
            if amount_diff_percent <= 0.1:  # 10% tolerance
                return {
                    'type': 'amount_match',
                    'deposit_request': deposit_request,
                    'amount_difference': amount - float(deposit_request.amount),
                    'confidence': 0.8
                }
        
        # No match found
        return {
            'type': 'no_match',
            'amount_difference': 0,
            'confidence': 0.0
        }
```

### **SOLUTION 2: FLEXIBLE DEPOSIT HANDLING**

```python
class FlexibleDepositHandler:
    """Handle various deposit scenarios flexibly"""
    
    def handle_deposit_scenario(self, match_result):
        """Handle different deposit scenarios"""
        
        scenario_type = match_result['type']
        amount_diff = match_result['amount_difference']
        
        if scenario_type == 'exact_reference_match':
            if abs(amount_diff) < 1.0:  # Within R1
                return self.process_exact_match(match_result)
            elif amount_diff > 0:  # Overpaid
                return self.process_overpayment(match_result)
            else:  # Underpaid
                return self.process_underpayment(match_result)
        
        elif scenario_type == 'amount_match':
            return self.process_amount_match(match_result)
        
        else:  # No match
            return self.process_new_deposit(match_result)
    
    def process_overpayment(self, match_result):
        """Handle overpayment scenario"""
        deposit_request = match_result['deposit_request']
        overpayment = match_result['amount_difference']
        
        # Calculate extra credits
        extra_credits = self.calculate_credits_for_amount(overpayment)
        
        # Process original amount
        self.activate_credits(deposit_request, deposit_request.credits_to_activate)
        
        # Process overpayment
        self.activate_credits(deposit_request, extra_credits)
        
        return {
            'success': True,
            'message': f'Deposit processed. {deposit_request.credits_to_activate} credits activated. '
                      f'Overpayment of R{overpayment:.2f} converted to {extra_credits} additional credits.',
            'total_credits': deposit_request.credits_to_activate + extra_credits
        }
    
    def process_underpayment(self, match_result):
        """Handle underpayment scenario"""
        deposit_request = match_result['deposit_request']
        underpayment = abs(match_result['amount_difference'])
        
        # Calculate credits for actual amount
        actual_credits = self.calculate_credits_for_amount(
            float(deposit_request.amount) - underpayment
        )
        
        # Activate credits for actual amount
        self.activate_credits(deposit_request, actual_credits)
        
        # Create partial payment record
        self.create_partial_payment_record(deposit_request, underpayment)
        
        return {
            'success': True,
            'message': f'Partial payment processed. {actual_credits} credits activated. '
                      f'R{underpayment:.2f} still outstanding.',
            'credits_activated': actual_credits,
            'outstanding_amount': underpayment,
            'requires_top_up': True
        }
```

### **SOLUTION 3: REFERENCE VALIDATION SYSTEM**

```python
class ReferenceValidator:
    """Validate and track reference numbers"""
    
    def validate_reference(self, reference, customer_code):
        """Validate reference number format and ownership"""
        
        # Check format (PC + 6 digits)
        if not re.match(r'^PC\d{6}$', reference):
            return {
                'valid': False,
                'error': 'Invalid reference format. Must be PC followed by 6 digits.'
            }
        
        # Check if reference exists and belongs to customer
        try:
            deposit_request = DepositRequest.objects.get(
                reference_number=reference,
                account__user__provider_profile__customer_code=customer_code
            )
            
            return {
                'valid': True,
                'deposit_request': deposit_request,
                'status': deposit_request.status
            }
            
        except DepositRequest.DoesNotExist:
            return {
                'valid': False,
                'error': 'Reference number not found for this customer code.'
            }
    
    def generate_reference(self, customer_code):
        """Generate unique reference number"""
        # Format: PC + customer_code_last_3 + sequence_number
        last_3 = customer_code[-3:] if len(customer_code) >= 3 else customer_code
        sequence = DepositRequest.objects.filter(
            account__user__provider_profile__customer_code=customer_code
        ).count() + 1
        
        return f"PC{last_3}{sequence:03d}"
```

### **SOLUTION 4: ADMIN INTERVENTION SYSTEM**

```python
class AdminInterventionHandler:
    """Handle cases requiring admin intervention"""
    
    def flag_for_admin_review(self, deposit_data, reason):
        """Flag deposit for admin review"""
        
        admin_alert = AdminAlert.objects.create(
            alert_type='deposit_review',
            priority='medium',
            title=f'Deposit Review Required: {reason}',
            description=f'Customer: {deposit_data["customer_code"]}\n'
                       f'Amount: R{deposit_data["amount"]}\n'
                       f'Reference: {deposit_data["reference"]}\n'
                       f'Reason: {reason}',
            deposit_data=deposit_data,
            requires_action=True
        )
        
        # Notify admins
        self.notify_admins(admin_alert)
        
        return admin_alert
    
    def handle_admin_decision(self, alert_id, decision, admin_notes):
        """Process admin decision on flagged deposit"""
        
        alert = AdminAlert.objects.get(id=alert_id)
        deposit_data = alert.deposit_data
        
        if decision == 'approve':
            # Process deposit as normal
            return self.process_deposit(deposit_data)
        
        elif decision == 'reject':
            # Reject deposit and notify customer
            return self.reject_deposit(deposit_data, admin_notes)
        
        elif decision == 'manual_adjustment':
            # Allow admin to manually adjust amount/credits
            return self.manual_adjustment(deposit_data, admin_notes)
```

## 🎯 RECOMMENDED IMPLEMENTATION STRATEGY

### **Phase 1: Basic Validation (Immediate)**
1. ✅ Add reference number validation
2. ✅ Add amount range validation (R50 - R10,000)
3. ✅ Add customer code validation
4. ✅ Add admin alerts for unusual deposits

### **Phase 2: Smart Matching (Week 2)**
1. 🔄 Implement deposit matching system
2. 🔄 Add tolerance-based amount matching
3. 🔄 Add overpayment handling
4. 🔄 Add partial payment tracking

### **Phase 3: Advanced Features (Week 3)**
1. 🔄 Add ML-based fraud detection
2. 🔄 Add automatic reconciliation
3. 🔄 Add customer notification system
4. 🔄 Add detailed audit trails

## 💡 BUSINESS RULES RECOMMENDATIONS

### **Amount Handling:**
- **Exact match**: Process normally
- **Overpayment (≤10%)**: Convert to extra credits
- **Overpayment (>10%)**: Flag for admin review
- **Underpayment (≤20%)**: Process as partial payment
- **Underpayment (>20%)**: Flag for admin review

### **Reference Handling:**
- **Valid reference**: Process normally
- **Invalid reference**: Flag for admin review
- **Missing reference**: Process with warning
- **Wrong customer code**: Reject immediately

### **Partial Payments:**
- **Allow partial payments**: Yes, with tracking
- **Minimum partial**: R50
- **Maximum outstanding**: R500
- **Top-up period**: 30 days

This system provides flexibility while maintaining security and auditability.

