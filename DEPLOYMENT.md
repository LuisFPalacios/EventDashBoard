# Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure you have completed all setup steps:

### 1. Supabase Setup ✓
- [ ] Created Supabase project
- [ ] Created database tables (events, venues) using SQL from SETUP.md
- [ ] Enabled Row Level Security (RLS) policies
- [ ] Configured Email authentication provider
- [ ] (Optional) Configured Google OAuth provider

### 2. Local Testing ✓
- [ ] Tested sign up with email
- [ ] Tested sign in with email
- [ ] (Optional) Tested Google OAuth sign in
- [ ] Created test events with multiple venues
- [ ] Edited existing events
- [ ] Deleted events
- [ ] Tested search functionality
- [ ] Tested filter by sport type
- [ ] Verified all toast notifications work
- [ ] Tested responsive design on mobile

## Deploy to Vercel

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
   ```bash
   cd fastbreak-event-dashboard
   git init
   git add .
   git commit -m "Initial commit: Fastbreak Event Dashboard"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in

2. Click "Add New..." → "Project"

3. Import your GitHub repository

4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Click "Deploy"

### Step 3: Update Supabase Configuration

After deployment, update your Supabase project:

1. Go to your Supabase project dashboard

2. Navigate to **Authentication** → **URL Configuration**

3. Update the following URLs with your Vercel deployment URL:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: Add `https://your-project.vercel.app/auth/callback`

4. If using Google OAuth:
   - Go to **Authentication** → **Providers** → **Google**
   - Update "Authorized redirect URIs" in Google Cloud Console
   - Add: `https://your-project.vercel.app/auth/callback`

### Step 4: Verify Deployment

1. Visit your deployed URL: `https://your-project.vercel.app`

2. Test the following:
   - [ ] Sign up with new account
   - [ ] Confirm email (check spam folder)
   - [ ] Sign in
   - [ ] Create an event
   - [ ] View event details
   - [ ] Edit event
   - [ ] Delete event
   - [ ] Search and filter
   - [ ] Sign out

## Troubleshooting

### Build Fails on Vercel

- Check that all environment variables are set correctly
- Review build logs for TypeScript or dependency errors
- Ensure `package.json` has all dependencies listed

### Authentication Not Working

- Verify Supabase URL and anon key are correct
- Check that redirect URLs are configured in Supabase
- Ensure email confirmation is enabled in Supabase Auth settings

### Database Queries Failing

- Verify RLS policies are correctly set up
- Check that the user is authenticated before making queries
- Review Supabase logs for database errors

### Google OAuth Not Working

- Verify Google OAuth credentials are correct in Supabase
- Ensure redirect URIs match exactly (including protocol)
- Check Google Cloud Console for any restrictions or errors

## Production Optimizations

### Optional Enhancements

1. **Custom Domain**
   - Add your domain in Vercel project settings
   - Update Supabase Auth URLs accordingly

2. **Email Templates**
   - Customize email templates in Supabase Auth settings
   - Add your branding and styling

3. **Analytics**
   - Add Vercel Analytics
   - Set up error tracking (e.g., Sentry)

4. **Performance Monitoring**
   - Enable Vercel Speed Insights
   - Monitor Core Web Vitals

5. **Database Optimization**
   - Add indexes for frequently queried columns
   - Set up database backups in Supabase

## Environment Variables Reference

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (auto-detected in Vercel)
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

## Support

For issues or questions:
- Check [SETUP.md](./SETUP.md) for initial setup
- Review [README.md](./README.md) for project documentation
- Check Vercel deployment logs
- Review Supabase dashboard logs

## Post-Deployment

After successful deployment:

1. ✓ Share your live URL
2. ✓ Create a demo account for testing
3. ✓ Document any custom configurations
4. ✓ Set up monitoring and alerts
5. ✓ Plan for regular backups

Congratulations! Your Fastbreak Event Dashboard is now live! 🎉
