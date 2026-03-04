# Email System: Current Implementation & Agreed Plan

## 1. “We’ve received your request” (client) – Option B: On verified

### How it works now
- **When a lead becomes verified:**  
  `backend/leads/signals.py` → `route_verified_lead` runs on `Lead.post_save` when `instance.status == 'verified'`.  
  It calls `route_lead(instance)`, which matches providers and sends **pro** emails + in-app + push.  
- **Client email:** There is **no** email to the client when the lead is verified. Only pros are notified.

### What “verified” means
- Lead has `status` (e.g. `pending` → `verified`).
- When `status` is set to `'verified'` (by auto-verify in `lead_auto_verifier` or by admin), `route_verified_lead` runs and `route_lead(instance)` notifies pros.
- The client is `lead.client` (FK to `User`). So we have `instance.client.email` and name.

### Agreed behaviour (Option B)
- Send **one** email to the **client** when the lead is verified (same moment pros are notified).
- **When:** In `route_verified_lead` (after `route_lead(instance)`), or inside `route_lead` after notifying providers.
- **To:** `lead.client.email`
- **Subject:** e.g. “We’ve received your request”
- **Body:** “We’ve received your request. Pros in your area have been notified. You’ll be contacted by interested providers.”

### Implementation (done)
- Added `send_lead_received_client_email(lead)` in `backend/utils/resend_service.py`; sends via Resend.
- Called from `route_verified_lead` in `backend/leads/signals.py` after `route_lead(instance)` (only if `lead.client` and `lead.client.email` exist).
- So: **on verified** = when the lead is set to `verified` and routing runs; client gets this email at that time.

---

## 2. “View Full Details” and credits (no free leads)

### How it works now
- **Pro lead email:** The link in the email is:
  - `FRONTEND_URL/provider/leads/{lead.id}/`  
  (set in `backend/utils/resend_service.py` and `backend/leads/services/lead_router.py`).
- **Backend unlock/purchase:**  
  - `backend/leads/ml_views.py` → `purchase_lead_access_view` (e.g. `/provider/leads/<id>/purchase/` or similar) checks:
    - User is provider, verified, etc.
    - **Credits:** Uses `Wallet.credits` (not provider_profile.credit_balance for this flow). If `wallet.credits < credit_cost`:
      - In “hybrid” mode: creates a reservation and sends the pro an EFT email (“Your lead is reserved — complete EFT to unlock”).
      - Returns 402 with `required_credits`, `available_credits`, `top_up_instructions` so the app can show “deposit / buy more credits”.
    - If enough credits: deducts credits, creates `LeadAccess`/unlock, returns unlocked data.
- **Frontend:**  
  - Leads list and lead detail live under provider dashboard (e.g. `LeadsPage`, lead detail page).  
  - Unlock/purchase calls the purchase endpoint. If the API returns 402 or “insufficient credits”, the UI can show “deposit” or “buy more credits”.  
  - No full contact details are shown before a successful unlock; backend only returns them after a successful purchase.

### Conclusion
- **We do not give free leads.** Unlock requires credits (or EFT reservation); the backend enforces this.
- **Email:** Keep one clear CTA: “View full details” or “View lead” → `https://www.proconnectsa.co.za/provider/leads/{lead.id}/` (or your current FRONTEND_URL).  
- **Credits:** No change needed in the email; the **app** (lead detail + purchase endpoint) already:
  - Checks credits before unlocking.
  - If insufficient: returns 402 and/or creates reservation + EFT email and/or returns `top_up_instructions`.  
- **Recommendation:** Ensure the **lead detail page** (when the pro clicks from the email) clearly shows:
  - Preview (e.g. title, location, budget) without full contact.
  - A single “View full details” / “Unlock” action that calls the purchase endpoint.
  - If the API returns “insufficient credits”, show a clear prompt to **deposit** or **buy more credits** (and link to wallet/credits page).  
  No code change required in the **email** for this; only optional frontend copy/flow tweaks so “View full details” always goes through the credit check.

---

## 3. Pro welcome email (on profile completion)

### How it works now
- **User signup (any user):**  
  `backend/users/views.py` (register) and `support/auth_views.py` / Google OAuth call `send_welcome_email(user)`.  
  So every **new user** gets one **generic** welcome email (from `backend/notifications/email_service.py` → template `emails/welcome.html`).  
  There is no separate “pro-only” welcome.
- **Provider profile creation:**  
  `backend/users/signals.py` → `create_provider_welcome_notification`: on `ProviderProfile.post_save` when `created=True` it creates an **in-app** notification only:  
  “Your provider profile for {business_name} has been created. Please complete verification to start receiving leads.”  
  **No email** is sent when the provider profile is created.

### Agreed behaviour
- Send a **pro welcome email** when the provider **completes** their provider profile (we treat “profile created” as the completion event for now; can later refine to “profile complete” e.g. business_name + service_categories + service_areas if you add a completeness check).
- Content: how leads work, how to respond, how to upgrade (future monetization).

### Implementation (done)
- Added `send_pro_welcome_email(user)` in `backend/utils/resend_service.py` (Resend); content: how leads work, how to respond, how to upgrade; links to dashboard and credits.
- Called from **ProviderProfile** `post_save` in `backend/users/signals.py` when `created=True` (after the in-app notification).
- Generic `send_welcome_email(user)` on user signup is unchanged. Pro welcome is an **extra** email when the provider profile is created.

---

## 4. Summary table

| Item | Current state | Agreed plan |
|------|----------------|------------|
| **Client: “We’ve received your request”** | Not implemented. Only pros are notified when lead is verified. | Send one email to `lead.client` when lead is **verified**, in `route_verified_lead` (after `route_lead`). Option B wording. |
| **Pro lead email: “View Full Details”** | Link to `FRONTEND_URL/provider/leads/{id}/`. Backend purchase endpoint checks credits; 402 + top-up if insufficient; no free leads. | No change in email. Ensure lead detail page uses purchase endpoint and shows “deposit / buy credits” when API returns insufficient credits. |
| **Pro welcome email** | Generic welcome on **user** signup only. In-app notification on **ProviderProfile** create; no email. | Add **pro welcome email** when **ProviderProfile** is created (in `users/signals.py`), with content: how leads work, how to respond, how to upgrade. |

---

## 5. Verified lead flow (for reference)

```
Lead created (pending)
  → auto_verify_lead (signals) may set status = 'verified'
  → post_save(Lead) with status='verified'
  → route_verified_lead runs
      → route_lead(instance)
          → match_providers(lead)
          → notify_providers(lead, providers)  ← email + in-app + push to pros
      → [NEW] send_lead_received_client_email(lead)  ← to lead.client
```

