# Quality Gate for Lead Router - Discussion

## Current Situation

**What we have:**
1. ✅ **Auto-verification system** - Calculates `verification_score` (0-100) and auto-verifies leads ≥ 70
2. ✅ **Lead router** - Routes verified leads to providers (no quality gate currently)
3. ✅ **ML Quality Service** - `LeadQualityMLService.predict_lead_quality()` returns 0-100 score
4. ✅ **SMS verification field** - `is_sms_verified` exists but seems optional

**The Problem:**
- Currently, ALL verified leads get routed to providers
- No filtering for spam, gibberish, duplicates, or low-quality leads
- Providers might get frustrated with bad leads

---

## Proposed Quality Gate Layers

### **Layer 1: Hard Rules (Must Pass)**
These are non-negotiable - if a lead fails, it's blocked.

1. **Description Quality**
   - ✅ Description exists and has minimum length (20 chars)
   - ✅ Not gibberish (repeated chars, no spaces, etc.)

2. **Contact Information**
   - ⚠️ **SMS Verification** - Should this be required?
     - **PRO:** Prevents spam, ensures real clients
     - **CON:** Might block legitimate leads if SMS fails or client doesn't verify
     - **RECOMMENDATION:** Make it optional for now, but give verified leads priority

3. **Disposable Email Detection**
   - ✅ Block known disposable email domains (mailinator, tempmail, etc.)

4. **Minimum Verification Score**
   - ✅ Use the `verification_score` from auto-verification (already calculated)
   - ✅ Threshold: ≥ 30 (very low bar, just to catch obvious spam)

### **Layer 2: ML Quality Score (If Available)**
Use existing `LeadQualityMLService` for intelligent filtering.

- **If ML model is trained:**
  - Get ML quality score (0-100)
  - Block if score < 40 (40/100 = low quality)
  
- **If ML model not trained:**
  - Skip this layer (fallback to rule-based only)

### **Layer 3: Duplicate Detection**
Prevent spam from same client.

- ✅ Same client + same category + within 24 hours = block
- ✅ Prevents duplicate submissions

---

## Implementation Strategy

### **Option A: Strict (Your Proposed Code)**
- Requires SMS verification
- Blocks aggressively
- **Risk:** Might block legitimate leads

### **Option B: Balanced (Recommended)**
- SMS verification = bonus points, not required
- Lower thresholds (more permissive)
- **Risk:** Some spam might slip through

### **Option C: Adaptive**
- Start permissive, learn from provider feedback
- Adjust thresholds based on conversion rates
- **Risk:** More complex

---

## My Recommendation: **Balanced Approach**

### **Why:**
1. **SMS verification shouldn't be required** - Too many legitimate leads might not verify
2. **Use existing systems** - Leverage `verification_score` from auto-verification
3. **ML as enhancement** - Use ML if available, but don't block if it's not trained
4. **Gradual tightening** - Start permissive, tighten based on real data

### **Proposed Thresholds:**
- **Hard Rules:**
  - Description ≥ 20 chars ✅
  - Not gibberish ✅
  - Not disposable email ✅
  - `verification_score` ≥ 30 ✅ (very low bar)

- **ML Quality (if available):**
  - ML score ≥ 40 (40/100) ✅

- **Duplicate Check:**
  - Same client + category + 24h = block ✅

- **SMS Verification:**
  - **Optional** - Verified leads get priority in matching, but not blocked

---

## Code Structure

```python
def route_lead(lead):
    """Main entry point with quality gate"""
    # Layer 1: Hard rules
    if not passes_hard_rules(lead):
        flag_for_review(lead, reason)
        return
    
    # Layer 2: ML quality (if available)
    ml_score = get_ml_quality_score(lead)
    if ml_score and ml_score < 40:
        flag_for_review(lead, f"ml_score_too_low:{ml_score}")
        return
    
    # Layer 3: Duplicate check
    if is_duplicate(lead):
        flag_for_review(lead, "duplicate_lead")
        return
    
    # All checks passed - route to providers
    providers = match_providers(lead)
    notify_providers(lead, providers)
```

---

## Questions to Answer

1. **SMS Verification:**
   - Should it be **required** (block if not verified)?
   - Or **optional** (bonus points, but don't block)?

2. **Thresholds:**
   - How strict should we be?
   - Start permissive and tighten, or strict from day 1?

3. **ML Integration:**
   - What if ML model isn't trained yet?
   - Should we block or just warn?

4. **Admin Review:**
   - Should blocked leads go back to `pending` status?
   - Or create a new `flagged` status?

---

## Next Steps

1. **Decide on SMS requirement** (I recommend optional)
2. **Set thresholds** (I recommend permissive to start)
3. **Implement quality gate** (integrate with existing systems)
4. **Monitor and adjust** (tighten based on real data)

---

**What do you think? Should we:**
- A) Make SMS verification required (strict)
- B) Make SMS optional but give bonus points (balanced)
- C) Skip SMS check entirely (permissive)

And what thresholds do you prefer?
