-- =====================================================
-- CRITICAL DATABASE FIXES FOR PRODUCTION SCALE
-- Run these migrations in your Supabase SQL Editor
-- =====================================================

-- Migration 1: Add database constraints for data integrity
-- =====================================================

-- Add length constraints to prevent data bloat
ALTER TABLE events
  ALTER COLUMN name TYPE VARCHAR(200);

ALTER TABLE events
  ALTER COLUMN description TYPE VARCHAR(2000);

ALTER TABLE venues
  ALTER COLUMN name TYPE VARCHAR(200);

ALTER TABLE venues
  ALTER COLUMN address TYPE VARCHAR(500);

-- Add CHECK constraint for sport_type enum
ALTER TABLE events
  ADD CONSTRAINT events_sport_type_check
  CHECK (sport_type IN ('Soccer', 'Basketball', 'Tennis', 'Baseball', 'Football', 'Volleyball', 'Hockey', 'Swimming', 'Other'));

-- Add CHECK constraint to ensure date_time is not too far in the past
ALTER TABLE events
  ADD CONSTRAINT events_date_time_check
  CHECK (date_time > NOW() - INTERVAL '1 year');

-- Migration 2: Add index for search performance
-- =====================================================

-- Add GIN index for full-text search on event names (PostgreSQL full-text search)
CREATE INDEX IF NOT EXISTS idx_events_name_search
  ON events USING gin(to_tsvector('english', name));

-- Add index on sport_type for fast filtering
CREATE INDEX IF NOT EXISTS idx_events_sport_type
  ON events(user_id, sport_type);

-- Add composite index for date sorting with user_id
CREATE INDEX IF NOT EXISTS idx_events_user_date
  ON events(user_id, date_time);

-- Migration 3: Fix N+1 query issue by denormalizing user_id to venues
-- =====================================================

-- Add user_id column to venues table
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Backfill user_id from events table
UPDATE venues v
SET user_id = e.user_id
FROM events e
WHERE v.event_id = e.id
  AND v.user_id IS NULL;

-- Add foreign key constraint
ALTER TABLE venues
  ADD CONSTRAINT venues_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL after backfill
ALTER TABLE venues
  ALTER COLUMN user_id SET NOT NULL;

-- Add index on user_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_venues_user_id
  ON venues(user_id);

-- Migration 4: Update RLS policies to use denormalized user_id
-- =====================================================

-- Drop old venue policies that cause N+1 queries
DROP POLICY IF EXISTS "Users can view venues for their events" ON venues;
DROP POLICY IF EXISTS "Users can create venues for their events" ON venues;
DROP POLICY IF EXISTS "Users can update venues for their events" ON venues;
DROP POLICY IF EXISTS "Users can delete venues for their events" ON venues;

-- Create new optimized policies using direct user_id
CREATE POLICY "Users can view their own venues"
  ON venues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own venues"
  ON venues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own venues"
  ON venues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own venues"
  ON venues FOR DELETE
  USING (auth.uid() = user_id);

-- Migration 5: Add trigger to auto-update updated_at timestamp
-- =====================================================

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to events table
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration 6: Add soft delete support (optional but recommended)
-- =====================================================

-- Add deleted_at column to events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index on deleted_at for filtering
CREATE INDEX IF NOT EXISTS idx_events_deleted_at
  ON events(deleted_at) WHERE deleted_at IS NULL;

-- Update existing RLS policies to exclude soft-deleted events
DROP POLICY IF EXISTS "Users can view their own events" ON events;
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can create their own events" ON events;
CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON events;
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can delete their own events" ON events;
CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Migration 7: Create transaction-safe function for creating events with venues
-- =====================================================

CREATE OR REPLACE FUNCTION create_event_with_venues(
  p_user_id UUID,
  p_name VARCHAR(200),
  p_sport_type TEXT,
  p_date_time TIMESTAMPTZ,
  p_description VARCHAR(2000),
  p_venues JSONB
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_venue JSONB;
BEGIN
  -- Insert event
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES (p_user_id, p_name, p_sport_type, p_date_time, p_description)
  RETURNING id INTO v_event_id;

  -- Insert venues
  FOR v_venue IN SELECT * FROM jsonb_array_elements(p_venues)
  LOOP
    INSERT INTO venues (event_id, user_id, name, address)
    VALUES (
      v_event_id,
      p_user_id,
      v_venue->>'name',
      v_venue->>'address'
    );
  END LOOP;

  RETURN v_event_id;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, transaction is automatically rolled back
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration 8: Add trigger to sync venue user_id with event user_id
-- =====================================================

CREATE OR REPLACE FUNCTION sync_venue_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When a venue is inserted, automatically set user_id from parent event
  SELECT user_id INTO NEW.user_id
  FROM events
  WHERE id = NEW.event_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_venue_user_id_trigger ON venues;
CREATE TRIGGER sync_venue_user_id_trigger
  BEFORE INSERT ON venues
  FOR EACH ROW
  EXECUTE FUNCTION sync_venue_user_id();

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify migrations were successful
-- =====================================================

-- Check constraints were added
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'events'::regclass
  AND conname LIKE '%check%';

-- Check indexes were created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('events', 'venues')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check venues have user_id populated
SELECT
  COUNT(*) as total_venues,
  COUNT(user_id) as venues_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM venues;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('events', 'venues')
ORDER BY tablename, policyname;
