# 🆕 Adding New Service Categories to Production

## New Categories Added
We've added the following service categories to support more service providers:

### Technical Services
- ☀️ **Solar Installation** - Solar panels and renewable energy
- 🏗️ **PVC Installation** - PVC ceilings, flooring, and walls
- 📺 **DSTV Installation** - Satellite TV installation and repair
- 📹 **CCTV Installation** - Security camera systems
- 🔐 **Access Control** - Biometric and security gate systems
- 🛰️ **Satellite Installation** - Satellite dish services
- 🏠 **Home Automation** - Smart home systems
- 🔔 **Alarm Systems** - Security alarms
- ⚡ **Electric Fencing** - Electric fence installation

## How to Add to Production Database

### Option 1: Run Management Command (Recommended)
SSH into your Hetzner server and run:

```bash
# Navigate to backend directory
cd /opt/proconnectsa-backend

# Activate virtual environment (if using one)
source venv/bin/activate

# Run the command
python manage.py add_new_service_categories
```

**Expected Output:**
```
✅ Created: Solar Installation
✅ Created: PVC Installation
✅ Created: DSTV Installation
✅ Created: CCTV Installation
✅ Created: Access Control
✅ Created: Satellite Installation
✅ Created: Home Automation
✅ Created: Alarm Systems
✅ Created: Electric Fencing

📊 Summary:
   ✅ Created: 9
   🔄 Updated: 0
   ⏭️  Skipped: 0
   📋 Total categories in database: 25
```

### Option 2: Django Shell
If the management command doesn't work, use Django shell:

```bash
python manage.py shell
```

Then paste:

```python
from django.utils.text import slugify
from backend.leads.models import ServiceCategory

new_categories = [
    ('Solar Installation', 'Solar panel installation, maintenance, and renewable energy solutions'),
    ('PVC Installation', 'PVC ceiling, flooring, and wall installation services'),
    ('DSTV Installation', 'DSTV satellite dish installation, repair, and signal optimization'),
    ('CCTV Installation', 'CCTV camera installation, monitoring systems, and security surveillance'),
    ('Access Control', 'Access control systems, biometric scanners, and security gates'),
    ('Satellite Installation', 'Satellite dish installation and alignment services'),
    ('Home Automation', 'Smart home systems, automation, and IoT device installation'),
    ('Alarm Systems', 'Burglar alarms, fire alarms, and security system installation'),
    ('Electric Fencing', 'Electric fence installation, repair, and maintenance'),
]

for name, desc in new_categories:
    cat, created = ServiceCategory.objects.get_or_create(
        slug=slugify(name),
        defaults={'name': name, 'description': desc, 'is_active': True}
    )
    print(f"{'✅ Created' if created else '⏭️  Exists'}: {name}")

print(f"\n📋 Total categories: {ServiceCategory.objects.count()}")
```

### Option 3: Django Admin
1. Go to: https://api.proconnectsa.co.za/admin/
2. Login as admin
3. Navigate to: **Leads → Service Categories**
4. Click **"Add Service Category"**
5. Manually add each category with:
   - Name (e.g., "Solar Installation")
   - Slug (auto-generated from name)
   - Description
   - Is Active: ✅ checked

## Verification

After adding categories, verify they're available:

```bash
python manage.py shell -c "from backend.leads.models import ServiceCategory; print([c.name for c in ServiceCategory.objects.filter(is_active=True)])"
```

## Frontend Updates

The frontend registration form has been automatically updated with these categories. After deployment:

1. **Vercel** will auto-deploy the frontend (2-5 minutes)
2. New providers can select these categories during registration
3. Existing providers can add them to their profiles

## Testing

1. Go to: https://proconnectsa.co.za/register
2. Select "Service Provider"
3. Go to Step 2
4. Check that new categories appear in:
   - Primary Service dropdown
   - Service Categories checkboxes

## Troubleshooting

### Categories not showing in frontend?
- Wait 5 minutes for Vercel deployment
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)

### Management command not found?
```bash
# Pull latest code
cd /opt/proconnectsa-backend
git pull origin main

# Restart Django
sudo systemctl restart proconnectsa-backend
```

### Database connection error?
Check that PostgreSQL is running:
```bash
docker ps | grep postgres
```

---
**Updated:** October 9, 2025
**Status:** ✅ Code Deployed, Awaiting Server Command Execution

