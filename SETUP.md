# Fastbreak Event Dashboard - Setup Instructions

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Wait for the database to be provisioned

### 2. Get Your Supabase Credentials
1. Go to Project Settings > API
2. Copy the `Project URL` and `anon/public` key
3. Update `.env.local` with these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. Create Database Schema
Run the following SQL in your Supabase SQL Editor (SQL Editor tab):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_sport_type ON events(sport_type);
CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_venues_event_id ON venues(event_id);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for venues table
CREATE POLICY "Users can view venues for their events"
  ON venues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create venues for their events"
  ON venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update venues for their events"
  ON venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete venues for their events"
  ON venues FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = venues.event_id
      AND events.user_id = auth.uid()
    )
  );
```

### 4. Configure Authentication
1. Go to Authentication > Providers
2. Enable **Email** provider (enabled by default)
3. Enable **Google** provider:
   - Follow Supabase's guide to set up Google OAuth
   - Add your Google OAuth credentials
   - Add authorized redirect URLs

### 5. Run the Application
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel project settings
5. Deploy!
