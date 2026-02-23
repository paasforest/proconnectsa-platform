# Safe Deployment Plan - Fix Migration Issue

## Current Status
- ✅ Model fixed: Notification.id now explicitly uses UUIDField
- ✅ Clean migration created: `0004_pushsubscription_clean.py` (no primary key changes)
- ⚠️ Server status: Need to verify
- ⚠️ Migration status: 0004 is stuck/hanging

## What We're Fixing
The problematic migration `0004_pushsubscription_delete_notificationtemplate_and_more.py` tries to change Notification.id from UUID to BigAutoField, which:
- Locks the database table
- Can take hours
- Freezes the site

## Safe Fix Steps

### Step 1: Verify Current State
- Check if API is responding
- Check migration status
- Check if services are running

### Step 2: Remove Problematic Migration (if exists on server)
- Delete the bad migration file on server
- Keep the database as-is (no rollback needed)

### Step 3: Deploy Clean Migration
- Push the fixed model (with UUIDField)
- Push the clean migration file
- Run migration (should take < 1 minute)

### Step 4: Verify Everything Works
- Test API endpoints
- Test notifications
- Test push subscriptions

## Risk Assessment
- **LOW RISK**: We're only:
  - Creating a new table (PushSubscription)
  - Removing unused table (NotificationTemplate)
  - Updating field names (all have defaults)
  - Updating indexes (additive operation)
  - NO primary key changes
  - NO data migration

## Timeline
- Step 1-2: 2 minutes
- Step 3: 1 minute (migration)
- Step 4: 2 minutes (verification)
- **Total: ~5 minutes**

## Rollback Plan
If anything goes wrong:
1. The migration can be faked: `python manage.py migrate notifications 0004 --fake`
2. Database state remains unchanged (we're not altering existing data)
3. Services continue running
