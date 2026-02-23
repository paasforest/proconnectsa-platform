# Vercel Environment Variable Setup for Firebase

## Variable Name (NOT the value)
```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```

## Variable Value
```
547788454489
```

## Steps to Add in Vercel:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. **Key/Name field**: Enter exactly this (no spaces, no quotes):
   ```
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   ```
5. **Value field**: Enter exactly this (no spaces, no quotes):
   ```
   547788454489
   ```
6. Select environments: **Production**, **Preview**, and **Development**
7. Click **Save**
8. **Redeploy** your application (or wait for next deployment)

## Important Notes:

- The **variable name** must start with a letter: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` ✅
- The **value** can be any string/number: `547788454489` ✅
- Do NOT put quotes around the value in Vercel
- Do NOT include `=` sign in the name field
- The variable name should be all uppercase with underscores

## If You Still Get "Invalid Characters" Error:

1. Make sure you're entering the name in the **Key/Name** field (not Value)
2. Make sure there are no extra spaces before/after the name
3. Try copying the name exactly: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
4. Make sure you're not accidentally putting the value in the name field

## Verify It's Set Correctly:

After adding, you should see in the environment variables list:
- **Name**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `547788454489` (or shows as hidden with dots)
