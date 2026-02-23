# Complete Lead Generation Flow - Discussion Document

## 🎯 Your Question: "How would this work from lead generating perspective?"

Let me trace the **complete flow from start to end** so we can discuss it properly.

---

## 📊 COMPLETE FLOW: Lead Creation → Provider Claim

### **STEP 1: Lead Creation (Client Side)**

**Where leads come from:**
1. **Public Website Form** (`/api/leads/create-public/`)
   - Client fills form on your website
   - Submits: title, description, category, location, budget, contact info
   - **Auto-verified** (status='verified' immediately)
   - Verification score: 75 (default for website leads)

2. **Admin Creates Lead** (Django Admin)
   - Admin manually creates lead
   - Sets status='verified' manually
   - Triggers same flow

3. **API/Partner Integration** (Future)
   - External systems create leads via API
   - Can set status='verified' or 'pending'

**What happens when lead is created:**
```
Client submits form
    ↓
Lead.objects.create(status='verified', ...)
    ↓
post_save signal fires (created=True, status='verified')
    ↓
[WITH NEW ROUTER] → lead_router.route_lead(lead)
```

---

### **STEP 2: Lead Router Activation (NEW - What We're Adding)**

**When signal fires:**
- Lead created with `status='verified'` ✅
- Lead updated to `status='verified'` ✅
- Admin bulk-verifies leads ✅ (now fixed)

**What router does:**
```
route_lead(lead)
    ↓
match_providers(lead)
    ├─→ Filter: verification_status='verified'
    ├─→ Filter: is_subscription_active=True
    ├─→ Filter: service_categories contains lead.category.slug
    ├─→ Filter: service_areas contains lead.city OR suburb
    ├─→ Sort: Premium → Subscription Tier → ID
    └─→ Return: Top 10 matching providers
    ↓
notify_providers(lead, providers)
    ├─→ For each provider:
    │     ├─→ Send EMAIL notification
    │     └─→ Create IN-APP notification
    └─→ Done!
```

**Result:**
- 3-10 providers get notified immediately
- Email + dashboard notification
- Providers know about lead within seconds

---

### **STEP 3: Provider Sees Notification**

**Provider receives:**
1. **Email** (instant):
   ```
   Subject: New Lead Available: Plumbing job in Woodstock
   
   Hi John,
   A new lead matching your services is available...
   
   View & Claim Lead: [link]
   ```

2. **In-App Notification** (dashboard):
   - Shows in notification bell
   - Title: "New Lead: [title]"
   - Message: "A new Plumbing lead is available in Woodstock..."
   - Link: Direct to lead details

**Provider actions:**
- Option A: Click email link → Goes to lead page
- Option B: Check dashboard → Sees notification → Clicks lead
- Option C: Browse available leads → Sees new lead in list

---

### **STEP 4: Provider Views Lead**

**Provider clicks lead → Views details:**

**What provider sees:**
- ✅ Lead title & description
- ✅ Service category
- ✅ Location (suburb, city)
- ✅ Budget range
- ✅ Urgency level
- ✅ Urgency timeline
- ❌ **NO CONTACT INFO YET** (masked)

**What happens:**
- `track_lead_view()` called
- `lead.views_count++` (Bark-style competition tracking)
- Provider can see:
  - How many other providers viewed this lead
  - Credit cost to unlock
  - Remaining slots (e.g., "2/3 claimed")

**Provider decision:**
- "This looks good, I want to contact them"
- Clicks "Purchase/Unlock Lead" button

---

### **STEP 5: Provider Purchases Lead**

**Provider clicks "Purchase Lead":**

**What happens:**
```
purchase_lead_access_view(lead_id)
    ↓
validate_purchase_rules(user, lead)
    ├─→ Check: User is provider ✅
    ├─→ Check: Provider is verified ✅
    ├─→ Check: Has enough credits ✅
    ├─→ Check: Service category matches ✅
    ├─→ Check: Service area matches ✅
    ├─→ Check: Lead is available ✅
    └─→ Check: Not at capacity (max_providers) ✅
    ↓
calculate_lead_credit_cost(lead, provider)
    ├─→ Base: R50 (1 credit)
    ├─→ ML multiplier applied
    └─→ Final cost: 1-3 credits (typically)
    ↓
[If premium provider] → FREE (no credits deducted)
[If regular provider] → Deduct credits from wallet
    ↓
Create LeadAccess record
    ├─→ provider = user
    ├─→ lead = lead
    ├─→ credit_cost = calculated cost
    └─→ unlocked_at = now()
    ↓
Create LeadAssignment record
    ├─→ status = 'purchased'
    ├─→ purchased_at = now()
    └─→ credit_cost = credits spent
    ↓
Update lead counts
    ├─→ assigned_providers_count++
    ├─→ responses_count++
    └─→ If at max_providers → is_available = False
    ↓
Return FULL contact details
    ├─→ Client name
    ├─→ Client phone
    ├─→ Client email
    ├─→ Full address
    └─→ All job details
```

**Result:**
- Provider now has full contact info
- Can call/email client directly
- Lead marked as "purchased" for this provider
- Credits deducted (unless premium)

---

### **STEP 6: Provider Contacts Client**

**Provider now has contact info:**
- Calls client
- Sends email
- Visits location (if needed)

**Provider updates status (optional):**
- Marks as "Contacted" in dashboard
- Adds notes about conversation
- Submits quote (if provided)

**What happens:**
```
mark_assignment_contacted(assignment_id)
    ├─→ assignment.contacted_at = now()
    ├─→ assignment.status = 'contacted'
    └─→ LeadAssignment saved
```

---

### **STEP 7: Client Chooses Provider**

**Client receives quotes from multiple providers:**
- Provider A: R5,000 quote
- Provider B: R4,500 quote
- Provider C: R6,000 quote

**Client decides:**
- Chooses Provider B (best price)
- Provider B marks job as "Won"
- Other providers mark as "Lost" (or no action)

**What happens:**
```
Provider B: mark_as_won()
    ├─→ assignment.won_job = True
    ├─→ assignment.status = 'won'
    └─→ Lead status = 'completed' (when job done)
```

---

### **STEP 8: Job Completion**

**After job is done:**
- Client leaves review
- Provider gets rated
- Lead status = 'completed'
- Provider profile metrics updated

---

## 🔄 COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: LEAD CREATION                                       │
└─────────────────────────────────────────────────────────────┘
Client fills form on website
    ↓
POST /api/leads/create-public/
    ↓
Lead.objects.create(status='verified', ...)
    ↓
post_save signal fires
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: LEAD ROUTER (NEW - What We're Adding)              │
└─────────────────────────────────────────────────────────────┘
lead_router.route_lead(lead)
    ↓
match_providers(lead)
    ├─→ Find providers with matching:
    │     • Service category (plumbing, electrical, etc.)
    │     • Service area (Cape Town, Johannesburg, etc.)
    │     • Active subscription
    │     • Verified status
    ↓
notify_providers(lead, providers)
    ├─→ Send EMAIL to each provider
    └─→ Create IN-APP notification
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: PROVIDER NOTIFICATION                               │
└─────────────────────────────────────────────────────────────┘
Provider receives:
    ├─→ Email: "New Lead Available: [title]"
    └─→ Dashboard notification
    ↓
Provider clicks notification/link
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: PROVIDER VIEWS LEAD                                │
└─────────────────────────────────────────────────────────────┘
GET /api/leads/{lead_id}/preview/
    ├─→ Shows lead details (MASKED contact info)
    ├─→ Shows credit cost
    ├─→ Shows competition stats (views_count, responses_count)
    └─→ Tracks view (views_count++)
    ↓
Provider decides: "I want this lead"
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: PROVIDER PURCHASES LEAD                            │
└─────────────────────────────────────────────────────────────┘
POST /api/leads/{lead_id}/purchase/
    ├─→ Validate: Has credits? Verified? Matches category/area?
    ├─→ Calculate cost (ML-based pricing)
    ├─→ Deduct credits (unless premium)
    ├─→ Create LeadAccess record
    ├─→ Create LeadAssignment record
    └─→ Return FULL contact details
    ↓
Provider now has:
    ├─→ Client name
    ├─→ Client phone
    ├─→ Client email
    ├─→ Full address
    └─→ All job details
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: PROVIDER CONTACTS CLIENT                           │
└─────────────────────────────────────────────────────────────┘
Provider calls/emails client
    ↓
Provider marks as "Contacted" (optional)
    ├─→ assignment.contacted_at = now()
    └─→ assignment.status = 'contacted'
    ↓
Provider submits quote (optional)
    ├─→ assignment.quote_amount = R4,500
    └─→ assignment.status = 'quoted'
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: CLIENT CHOOSES PROVIDER                            │
└─────────────────────────────────────────────────────────────┘
Client receives quotes from multiple providers
    ↓
Client chooses Provider B
    ↓
Provider B marks as "Won"
    ├─→ assignment.won_job = True
    └─→ assignment.status = 'won'
    ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: JOB COMPLETION                                     │
└─────────────────────────────────────────────────────────────┘
Job completed
    ├─→ Client leaves review
    ├─→ Provider gets rated
    └─→ Lead status = 'completed'
```

---

## 🎯 Key Points in the Flow

### **Where Lead Router Fits:**
- **Step 2** - Immediately after lead is verified
- **Purpose**: Get leads to providers FAST (before they check dashboard)
- **Result**: Providers know about leads within seconds

### **Current Flow (Without Router):**
- Lead verified → Nothing happens automatically
- Providers must manually check dashboard
- Leads sit unclaimed for hours/days

### **New Flow (With Router):**
- Lead verified → Router finds matching providers
- Providers get email + notification immediately
- Leads get claimed within minutes

---

## 💡 Questions for Discussion:

1. **Does this flow match what you want?**
   - Lead creation → Router → Notification → Purchase → Contact → Win

2. **Any gaps or missing steps?**
   - Should router also create assignments automatically?
   - Should there be a "reservation" step before purchase?

3. **What about premium providers?**
   - Should they get free leads automatically?
   - Or still need to "purchase" (just no credit cost)?

4. **Multiple providers per lead:**
   - Current: max 3 providers can purchase
   - Router notifies 10 providers (more than max)
   - Is this correct? (First 3 to purchase get it)

5. **What happens if no providers match?**
   - Lead sits unclaimed?
   - Should we expand search (broader location/category)?

---

## 📋 Current State Analysis:

**What already works:**
- ✅ Lead creation (public endpoint)
- ✅ Lead verification
- ✅ Provider viewing leads
- ✅ Provider purchasing leads
- ✅ Credit deduction
- ✅ Contact info unlocking

**What's missing (what router adds):**
- ❌ Automatic provider notification when lead verified
- ❌ Email notifications to matching providers
- ❌ In-app notifications for new leads

**The router fills the gap between:**
- Lead verified → Provider knows about it

---

## 🤔 Discussion Points:

1. **Should router create assignments automatically?**
   - Current: Router only notifies, provider must purchase
   - Alternative: Router creates assignment, provider just needs to unlock contact

2. **How many providers to notify?**
   - Current plan: 10 providers
   - Lead max_providers: 3
   - Logic: Notify more to ensure 3 actually purchase

3. **What if provider doesn't have credits?**
   - Current: Can't purchase
   - Should router skip them? Or notify anyway (they can top up)?

4. **Premium provider flow:**
   - Premium providers get free leads
   - Should router auto-unlock for them? Or just notify?

---

**Please review this flow and let me know:**
- Does it match your vision?
- Any changes needed?
- Any concerns or questions?

**We're still in discussion - no implementation yet!** 🗣️
