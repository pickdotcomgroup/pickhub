# Railway Deployment - Logout Redirect Fix

## Problem
After deploying to Railway, when users logout, they are redirected to `https://localhost:8080/signin` instead of your Railway domain.

## Root Cause
The issue occurs because NextAuth.js needs to know the correct base URL of your application. Without the proper `AUTH_URL` environment variable set in Railway, it defaults to localhost.

## Solution

### 1. Set Environment Variables in Railway

You need to configure the following environment variables in your Railway project:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the **Variables** tab
4. Add/Update these environment variables:

```bash
AUTH_URL=https://your-railway-domain.up.railway.app
AUTH_TRUST_HOST=true
AUTH_SECRET=your-secret-key-here
```

**Important Notes:**
- Replace `your-railway-domain.up.railway.app` with your actual Railway domain
- If you don't have an `AUTH_SECRET`, generate one using: `npx auth secret`
- `AUTH_TRUST_HOST=true` is required for Railway deployment

### 2. Code Changes Made

The following fixes have been applied to your codebase:

#### a. Fixed Auth Configuration (`src/server/auth/config.ts`)
- Changed `signIn: "/auth"` to `signIn: "/signin"` to match your actual signin page
- `trustHost: true` is already set, which allows NextAuth to work with Railway's proxy

#### b. Updated Environment Documentation (`.env.example`)
- Added clear instructions for setting `AUTH_URL` in production
- Changed `AUTH_TRUST_HOST` default to `"true"` for production compatibility

### 3. How to Deploy the Fix

1. **Commit the code changes:**
   ```bash
   git add .
   git commit -m "Fix logout redirect for Railway deployment"
   git push
   ```

2. **Set environment variables in Railway:**
   - Navigate to your Railway project
   - Go to Variables tab
   - Set `AUTH_URL` to your Railway domain (e.g., `https://pickhub-production.up.railway.app`)
   - Set `AUTH_TRUST_HOST` to `true`
   - Ensure `AUTH_SECRET` is set (generate with `npx auth secret` if needed)

3. **Redeploy (if needed):**
   - Railway should automatically redeploy when you push
   - If not, trigger a manual redeploy from the Railway dashboard

### 4. Verify the Fix

After deployment:
1. Visit your Railway domain
2. Sign in to your account
3. Click logout
4. Verify you're redirected to `https://your-railway-domain.up.railway.app/signin` (not localhost)

## Additional Notes

### Why This Happens
- NextAuth.js uses the `AUTH_URL` environment variable to determine the base URL for redirects
- In development, this defaults to `http://localhost:3000`
- In production, you must explicitly set it to your production domain
- Railway uses a reverse proxy, so `AUTH_TRUST_HOST=true` is required

### Environment Variables Priority
NextAuth.js checks for the base URL in this order:
1. `AUTH_URL` environment variable (highest priority)
2. `NEXTAUTH_URL` environment variable (legacy, still supported)
3. Request headers (when `trustHost: true`)

### Troubleshooting

If the issue persists:

1. **Check Railway logs:**
   ```bash
   # In Railway dashboard, check the deployment logs
   ```

2. **Verify environment variables are set:**
   - Go to Railway Variables tab
   - Ensure `AUTH_URL` is exactly your Railway domain (with https://)
   - No trailing slash in the URL

3. **Clear browser cache and cookies:**
   - Old session data might cause issues
   - Try in an incognito/private window

4. **Check for typos:**
   - Ensure `AUTH_URL` matches your Railway domain exactly
   - Include `https://` protocol
   - No trailing slash

## Summary

The fix involves:
1. ✅ Setting `AUTH_URL` environment variable in Railway to your production domain
2. ✅ Setting `AUTH_TRUST_HOST=true` in Railway
3. ✅ Fixed signin page path in auth config
4. ✅ Updated documentation for future deployments

After applying these changes and setting the environment variables in Railway, logout will correctly redirect to your Railway domain instead of localhost.
