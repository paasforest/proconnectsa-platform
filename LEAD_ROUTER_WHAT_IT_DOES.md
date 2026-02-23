# Lead Router - What It Will Achieve

## 🎯 Primary Goal

**Automatically notify matching providers when a lead becomes verified, so they can quickly claim it.**

---

## 📋 What Happens When a Lead is Verified

### Current Flow (Before Router):
1. Lead created with `status='pending'`
2. Admin/client verifies lead → `status='verified'`
3. **❌ Nothing happens automatically**
4. Providers must manually check dashboard to see new leads
5. Leads sit unclaimed until providers discover them

### New Flow (With Router):
1. Lead created with `status='pending'`
2. Admin/client verifies lead → `status='verified'`
3. **✅ Signal fires automatically**
4. **✅ Router finds matching providers**
5. **✅ Providers get email + in-app notification immediately**
6. **✅ Providers can claim lead right away**

---

## 🔄 Complete Flow Diagram

```
Lead Created/Updated → status='verified'
         │
         ▼
   post_save signal fires
         │
         ▼
   lead_router.route_lead(lead)
         │
         ├─→ match_providers(lead)
         │     │
         │     ├─→ Filter: verification_status='verified'
         │     ├─→ Filter: is_subscription_active=True
         │     ├─→ Filter: service_categories contains lead.category.slug
         │     ├─→ Filter: service_areas contains lead.city OR suburb
         │     │
         │     └─→ Sort: Premium → Subscription Tier → ID
         │     └─→ Return: Top 10 matching providers
         │
         └─→ notify_providers(lead, providers)
               │
               ├─→ For each provider:
               │     ├─→ Send email notification
               │     └─→ Create in-app Notification record
               │
               └─→ Done! Providers notified
```

---

## ✅ What It Achieves

### 1. **Immediate Provider Notifications**
- **Before**: Providers check dashboard manually, might miss leads
- **After**: Providers get instant email + in-app notification when matching lead is verified
- **Result**: Faster lead claims, better provider engagement

### 2. **Intelligent Matching**
- Matches providers based on:
  - ✅ Service categories (plumbing, electrical, etc.)
  - ✅ Service areas (Cape Town, Johannesburg, etc.)
  - ✅ Active subscription/credits
  - ✅ Verification status
- **Result**: Only relevant providers get notified (no spam)

### 3. **Priority-Based Routing**
- Premium listing providers notified first
- Then by subscription tier (Enterprise → Pro → Advanced → Basic)
- **Result**: Higher-value providers get first chance at leads

### 4. **Automatic & Reliable**
- Works automatically via Django signals
- No manual intervention needed
- Fires on:
  - New leads created with `status='verified'`
  - Existing leads updated to `status='verified'`
  - Admin bulk verification actions
- **Result**: Consistent, reliable lead distribution

### 5. **Provider Experience**
- **Email**: Personal notification with lead details
- **In-App**: Dashboard notification with link to lead
- **Result**: Multiple touchpoints ensure providers see the lead

---

## 📊 Example Scenario

### Scenario: New Plumbing Lead in Cape Town

**Lead Details:**
- Category: Plumbing
- Location: Woodstock, Cape Town
- Status: Just verified

**What Router Does:**

1. **Finds Matching Providers:**
   - Provider A: Plumbing + Cape Town (Premium) ✅
   - Provider B: Plumbing + Cape Town (Pro) ✅
   - Provider C: Electrical + Cape Town ❌ (wrong category)
   - Provider D: Plumbing + Johannesburg ❌ (wrong location)

2. **Sorts by Priority:**
   - Provider A (Premium) → notified first
   - Provider B (Pro) → notified second

3. **Sends Notifications:**
   - **Email to Provider A:**
     ```
     Subject: New Lead Available: Plumbing job in Woodstock
     
     Hi John,
     
     A new lead matching your services is available on ProConnectSA.
     
     JOB DETAILS
     -----------
     Service:   Plumbing
     Title:     Leaking pipe repair
     Location:  Woodstock, Cape Town
     Urgency:   This Week
     Budget:    R1,000 - R5,000
     
     Be one of the first 3 providers to claim this lead.
     
     View & Claim Lead: https://proconnectsa.co.za/provider/leads/{lead-id}/
     ```
   
   - **In-App Notification:**
     - Title: "New Lead: Leaking pipe repair"
     - Message: "A new Plumbing lead is available in Woodstock, Cape Town..."
     - Priority: Medium (or High if urgent)
     - Link: Direct to lead details

4. **Result:**
   - Provider A sees email immediately
   - Provider A sees notification in dashboard
   - Provider A clicks through and claims lead
   - Lead gets claimed within minutes instead of hours/days

---

## 🎯 Key Benefits

### For Providers:
- ✅ **Faster lead access** - Know about leads immediately
- ✅ **No manual checking** - Leads come to you
- ✅ **Better chance to claim** - Get notified before others
- ✅ **Relevant leads only** - Only see leads matching your services

### For Platform:
- ✅ **Higher lead claim rate** - Leads get claimed faster
- ✅ **Better provider engagement** - Providers stay active
- ✅ **Reduced lead waste** - Fewer leads expire unclaimed
- ✅ **Automated workflow** - No manual lead distribution needed

### For Clients:
- ✅ **Faster responses** - Providers respond quickly
- ✅ **More quotes** - Multiple providers see the lead
- ✅ **Better service** - Active providers get leads first

---

## ⚠️ What It Does NOT Do

### ❌ Does NOT Create LeadAssignments
- Router only sends notifications
- Providers must still manually claim/purchase leads
- This is intentional - providers choose which leads to pursue

### ❌ Does NOT Deduct Credits
- No automatic credit deduction
- Credits only deducted when provider purchases lead
- Router is notification-only

### ❌ Does NOT Guarantee Claims
- Notifications are sent, but providers may:
  - Not check email immediately
  - Not have enough credits
  - Not be interested in that specific lead
  - Already be busy with other jobs

### ❌ Does NOT Replace Manual Assignment
- Admin can still manually assign leads
- Router is complementary, not replacement
- Both systems can coexist

---

## 🔍 Technical Details

### Signal Safety
- ✅ Never raises exceptions (safe for post_save)
- ✅ Logs all errors without breaking lead creation
- ✅ Continues even if one notification fails

### Performance
- ✅ Efficient filtering (uses Django ORM)
- ✅ Limits to top 10 providers (prevents spam)
- ✅ Async email sending (doesn't block request)

### Reliability
- ✅ Works on lead creation (`created=True`)
- ✅ Works on status updates (`status='verified'`)
- ✅ Works on admin bulk actions (now fixed)
- ✅ Handles edge cases gracefully

---

## 📈 Expected Outcomes

### Metrics That Should Improve:
1. **Lead Claim Time**: From hours/days → minutes
2. **Lead Claim Rate**: More leads get claimed
3. **Provider Engagement**: More active providers
4. **Client Satisfaction**: Faster provider responses

### What Success Looks Like:
- ✅ Providers receive notifications within seconds of lead verification
- ✅ Leads get claimed within 1-2 hours (instead of days)
- ✅ Providers report "I see leads immediately now"
- ✅ Admin sees fewer "unclaimed leads" warnings

---

## 🚨 Important Considerations

### 1. **Notification Type**
- Currently uses `'lead_verified'` (exists in model)
- Could add `'new_lead'` if preferred (requires migration)

### 2. **Email Delivery**
- Depends on Django email backend working
- If email fails, in-app notification still created
- Provider can see notification in dashboard

### 3. **Provider Filters**
- Only verified providers with active subscriptions
- Only providers with matching categories/areas
- Premium providers get priority

### 4. **Rate Limiting**
- Router sends max 10 notifications per lead
- Prevents notification spam
- Top 10 providers by priority get notified

---

## ✅ Summary

**The Lead Router will:**
1. ✅ Automatically find matching providers when leads are verified
2. ✅ Send email + in-app notifications to those providers
3. ✅ Prioritize premium/higher-tier providers
4. ✅ Work reliably via Django signals
5. ✅ Improve lead claim rates and provider engagement

**It will NOT:**
- ❌ Create automatic assignments
- ❌ Deduct credits automatically
- ❌ Guarantee lead claims
- ❌ Replace manual assignment tools

**The goal is simple: Get the right leads to the right providers, fast.**
