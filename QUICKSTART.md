# Quick Start Guide

Get the Fastbreak Event Dashboard up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step 1: Clone and Install (2 minutes)

```bash
cd fastbreak-event-dashboard
npm install
```

## Step 2: Supabase Setup (5 minutes)

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for provisioning

### Run Database Setup

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the entire SQL script from [SETUP.md](./SETUP.md#3-create-database-schema)
3. Paste and click "Run"

### Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - `Project URL`
   - `anon/public` key

## Step 3: Configure Environment (1 minute)

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Run Development Server (1 minute)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 5: Test the App (1 minute)

1. Click "Sign up"
2. Create an account (use a real email)
3. Check your email and confirm
4. Sign in
5. Create your first event!

## What's Next?

### Enable Google OAuth (Optional)

Follow the detailed instructions in [SETUP.md](./SETUP.md#4-configure-authentication)

### Deploy to Production

Follow the deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

### Customize

- Update colors in `tailwind.config.ts`
- Add more sport types in `components/events/event-form.tsx`
- Customize email templates in Supabase Auth settings

## Troubleshooting

### "Not authenticated" error
- Make sure you've confirmed your email
- Check that environment variables are set correctly
- Try signing out and back in

### Database errors
- Verify the SQL script ran successfully
- Check Supabase logs in Dashboard → Logs
- Ensure RLS policies were created

### Can't sign up
- Check your email (including spam folder)
- Verify email auth is enabled in Supabase
- Try using a different email provider

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 🔧 Check [SETUP.md](./SETUP.md) for detailed setup
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- 📊 Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture

## Pro Tips

1. **Development**: Use Chrome DevTools to inspect network requests and see Server Actions
2. **Database**: Use Supabase Table Editor to view your data in real-time
3. **Debugging**: Check browser console and terminal for error messages
4. **Performance**: Use React DevTools to profile component renders

Happy coding! 🎉
