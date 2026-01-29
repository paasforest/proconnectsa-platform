# ✅ ProConnectSA → Immigration AI Integration Confirmation

## 📋 **WHAT HAS BEEN DONE ON PROCONNECTSA SIDE**

### 1. **All Immigration AI Links Redirect to External Website**
   - ✅ All links point to: `https://www.immigrationai.co.za`
   - ✅ All links open in new tab (`target="_blank"`)
   - ✅ No redirects affect ProConnectSA's own functionality

### 2. **UTM Tracking Parameters Added to ALL Links**

All redirects include these **standardized UTM parameters**:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `utm_source` | `proconnectsa` | Identifies traffic source |
| `utm_medium` | `website` | Traffic medium type |
| `utm_campaign` | `immigration_integration` | Campaign identifier |
| `utm_content` | `hero_banner`, `nav_menu`, `footer_link`, or `services-page` | Entry point identifier |

### 3. **Plan Parameter (for Pre-selection)**

When users click on pricing plan buttons, the URL includes:
- `plan=starter` OR `plan=entry` OR `plan=professional` OR `plan=enterprise`

**Plan mapping:**
- `Starter Plan` → `plan=starter`
- `Entry Plan` → `plan=entry`
- `Professional Plan` → `plan=professional`
- `Enterprise Plan` → `plan=enterprise`

---

## 🔗 **ALL IMMIGRATION AI REDIRECT LOCATIONS**

### **Homepage (page.tsx)**
1. **Navigation Menu Button** - "🌍 Want to Travel Overseas?"
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=nav_menu`

2. **Hero Section - "Start Your Immigration Journey" Button**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner`

3. **Hero Section - "Check My Eligibility" Button**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner`

4. **Pricing Section - "View All Plans & Start Today" Button**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner`

### **Header Navigation (Header.tsx)**
5. **Main Navigation Link - "Immigration"**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=nav_menu`

### **Client Header Navigation (ClientHeader.tsx)**
6. **Client Navigation Link - "Immigration"**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=nav_menu`

### **Footer (Footer.tsx)**
7. **Footer Services Link - "Immigration AI"**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=footer_link`

### **Services Page (services/page.tsx)**
8. **Immigration Category Click**
   - URL: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=services-page`

### **Immigration Landing Page (/immigration/page.tsx)**
9. **All Pricing Plan Buttons** (with plan parameter)
   - Starter: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=starter&plan=starter`
   - Entry: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=entry&plan=entry`
   - Professional: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=professional&plan=professional`
   - Enterprise: `https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=enterprise&plan=enterprise`

---

## 📊 **EXAMPLE URLS THAT WILL BE GENERATED**

### **Standard Click (No Plan Selected):**
```
https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=hero_banner
```

### **With Plan Pre-selection:**
```
https://www.immigrationai.co.za?utm_source=proconnectsa&utm_medium=website&utm_campaign=immigration_integration&utm_content=professional&plan=professional
```

---

## ✅ **WHAT IMMIGRATION AI WEBSITE NEEDS TO DO**

### **1. Read UTM Parameters (for Google Analytics)**

Google Analytics will **automatically** track these UTM parameters if GA4 is set up on Immigration AI website. No code changes needed - GA4 captures UTM parameters by default.

**To view in Google Analytics:**
- Go to: **Acquisition → Campaigns → `immigration_integration`**
- Or: **Acquisition → All Traffic → Source/Medium → Filter: `proconnectsa / website`**
- View by **Campaign Content** to see `hero_banner`, `nav_menu`, `footer_link`, etc.

### **2. Read Plan Parameter (for Pre-selection)**

**Required Code on Immigration AI Website:**

```javascript
// On page load, check for 'plan' parameter
const urlParams = new URLSearchParams(window.location.search);
const planParam = urlParams.get('plan');

if (planParam) {
  // Pre-select the plan in your signup form
  // Values will be: 'starter', 'entry', 'professional', or 'enterprise'
  selectPlan(planParam);
}
```

**Example implementation:**
- If `plan=professional` → Pre-select "Professional Plan" in signup form
- If `plan=starter` → Pre-select "Starter Plan" in signup form
- etc.

### **3. Store UTM Parameters (Optional - for conversion tracking)**

If you want to track which ProConnectSA entry point leads to signups:

```javascript
// Store UTM parameters in localStorage or sessionStorage
const utmParams = {
  source: urlParams.get('utm_source'),
  medium: urlParams.get('utm_medium'),
  campaign: urlParams.get('utm_campaign'),
  content: urlParams.get('utm_content')
};

// Send to your backend during signup
// This allows you to see which ProConnectSA links convert best
```

---

## 🎯 **TRACKING SUMMARY**

### **What ProConnectSA Sends:**
- ✅ UTM parameters for Google Analytics tracking
- ✅ Plan parameter for pre-selecting subscription plan
- ✅ Analytics events on ProConnectSA side (gtag events)

### **What Immigration AI Receives:**
- ✅ `utm_source=proconnectsa` - Traffic from ProConnectSA
- ✅ `utm_medium=website` - From website
- ✅ `utm_campaign=immigration_integration` - Campaign name
- ✅ `utm_content` - Entry point (hero_banner, nav_menu, footer_link, etc.)
- ✅ `plan` - Plan identifier (starter, entry, professional, enterprise)

---

## 📝 **VERIFICATION CHECKLIST**

### **On ProConnectSA (✅ DONE):**
- [x] All Immigration AI links redirect to `www.immigrationai.co.za`
- [x] All links include UTM parameters
- [x] Plan parameter included for pricing buttons
- [x] Links open in new tab
- [x] ProConnectSA functionality unaffected
- [x] Changes pushed to GitHub

### **On Immigration AI (📋 TO DO):**
- [ ] Google Analytics 4 installed and configured
- [ ] Plan parameter read from URL on page load
- [ ] Plan pre-selection implemented in signup form
- [ ] UTM parameters stored (optional - for conversion tracking)
- [ ] Test redirects from ProConnectSA
- [ ] Verify UTM tracking in Google Analytics

---

## 🔍 **TESTING INSTRUCTIONS**

### **Test from ProConnectSA:**
1. Visit `https://www.proconnectsa.co.za`
2. Click any Immigration AI link
3. Check URL bar - should see UTM parameters
4. Check if plan is pre-selected (if clicking pricing button)

### **Test in Google Analytics:**
1. Wait 24-48 hours for data to appear
2. Go to Immigration AI Google Analytics
3. Check: **Acquisition → Campaigns → `immigration_integration`**
4. Should see traffic from `proconnectsa` source

---

## 📞 **CONFIGURATION FILE LOCATION**

**ProConnectSA Configuration:**
- File: `procompare-frontend/src/config/immigration.ts`
- URL: `IMMIGRATION_AI_URL = 'https://www.immigrationai.co.za'`

---

## ✅ **CONFIRMATION**

**ProConnectSA Side: COMPLETE ✅**
- All redirects implemented
- All UTM parameters added
- Plan parameters included
- Analytics tracking active
- Changes deployed

**Immigration AI Side: PENDING**
- Needs to read `plan` parameter for pre-selection
- Needs Google Analytics to track UTM parameters (if not already set up)

---

**Last Updated:** 2025-01-23
**Status:** ProConnectSA integration complete, ready for Immigration AI alignment


