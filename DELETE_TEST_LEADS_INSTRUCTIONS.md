# Delete Test Leads - Instructions

## Overview
This guide explains how to find and delete test leads from the production database.

## Step 1: Check What Will Be Deleted (Dry Run)

SSH into your Hetzner server and run:

```bash
cd /opt/proconnectsa
source venv/bin/activate
python manage.py delete_test_leads --dry-run
```

This will show you:
- How many test leads were found
- Details of each test lead (title, description, client, status)
- Warnings if any providers have accessed/purchased these leads

## Step 2: Review the Results

Carefully review the output to ensure:
- ✅ Only test leads are listed
- ✅ No real leads are included
- ⚠️ Check if any providers have purchased these leads (warnings will be shown)

## Step 3: Delete the Test Leads

If you're satisfied with the dry-run results, run:

```bash
python manage.py delete_test_leads --force
```

**OR** for interactive confirmation:

```bash
python manage.py delete_test_leads
```

You'll be prompted to type "DELETE" to confirm.

## What Gets Deleted

The command will:
1. Delete all `LeadAccess` records for test leads
2. Delete all `LeadAssignment` records for test leads  
3. Delete the test leads themselves

## Test Lead Patterns Detected

The command finds leads matching any of these patterns:

**In Title:**
- Contains "test:" (e.g., "Premium test: Electrical")
- Contains "test -"
- Contains " #" (e.g., "Service #1")
- Contains "test lead" or "TEST LEAD"
- Contains "[test]" or "(test)"

**In Description:**
- Contains "test lead" or "TEST LEAD"
- Contains "this is test lead"
- Contains "test lead number"
- Contains "location filter test"
- Contains "premium test"
- Contains "[test]" or "(test)"

**Other:**
- Source field = 'test'
- Client email contains test patterns (test@, @test., testuser, etc.)

## Safety Features

- ✅ Dry-run mode to preview deletions
- ✅ Shows warnings if leads have been accessed by providers
- ✅ Requires confirmation (unless --force is used)
- ✅ Shows detailed information before deletion

## After Deletion

After deleting test leads:
1. The filtering system will continue to hide any remaining test leads from providers
2. Providers will only see real, legitimate leads
3. The platform maintains its professional appearance
