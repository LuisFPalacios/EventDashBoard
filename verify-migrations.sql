-- =====================================================
-- MIGRATION VERIFICATION QUERIES
-- Run these in Supabase SQL Editor to verify migrations
-- =====================================================

-- 1. Check that constraints were added to events table
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'events'::regclass
ORDER BY conname;

-- Expected results:
-- - events_date_time_check
-- - events_sport_type_check
-- - events_pkey (primary key)
-- - events_user_id_fkey (foreign key)

-- =====================================================

-- 2. Check column types were changed
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('events', 'venues')
  AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Expected for events:
-- - name: character varying(200)
-- - description: character varying(2000)
-- - sport_type: character varying

-- Expected for venues:
-- - name: character varying(200)
-- - address: character varying(500)

-- =====================================================

-- 3. Check that indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('events', 'venues')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected indexes:
-- - idx_events_deleted_at
-- - idx_events_name_search (GIN index)
-- - idx_events_sport_type
-- - idx_events_user_date
-- - idx_events_user_id
-- - idx_venues_user_id

-- =====================================================

-- 4. Check venues have user_id column populated
SELECT
  COUNT(*) as total_venues,
  COUNT(user_id) as venues_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM venues;

-- Expected: missing_user_id should be 0

-- =====================================================

-- 5. Check that venues.user_id foreign key exists
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'venues'::regclass
  AND conname LIKE '%user_id%';

-- Expected: venues_user_id_fkey

-- =====================================================

-- 6. Check RLS policies were updated
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('events', 'venues')
ORDER BY tablename, policyname;

-- Expected policies on events:
-- - Users can create their own events
-- - Users can delete their own events
-- - Users can update their own events
-- - Users can view their own events

-- Expected policies on venues:
-- - Users can create their own venues
-- - Users can delete their own venues
-- - Users can update their own venues
-- - Users can view their own venues

-- =====================================================

-- 7. Check that deleted_at column was added to events
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name = 'deleted_at';

-- Expected: deleted_at, timestamp with time zone, YES

-- =====================================================

-- 8. Check triggers were created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('events', 'venues')
ORDER BY event_object_table, trigger_name;

-- Expected triggers:
-- - update_events_updated_at (on events table)
-- - sync_venue_user_id_trigger (on venues table)

-- =====================================================

-- 9. Check that functions were created
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_event_with_venues',
    'update_updated_at_column',
    'sync_venue_user_id'
  )
ORDER BY routine_name;

-- Expected functions:
-- - create_event_with_venues (returns uuid)
-- - sync_venue_user_id (returns trigger)
-- - update_updated_at_column (returns trigger)

-- =====================================================

-- 10. Test that soft delete works (won't show deleted events)
-- First, check current count
SELECT COUNT(*) as total_events FROM events WHERE deleted_at IS NULL;

-- Test query that should only return non-deleted events
SELECT id, name, deleted_at FROM events LIMIT 5;

-- =====================================================

-- 11. Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('events', 'venues')
  AND schemaname = 'public';

-- Expected: rowsecurity should be 't' (true) for both tables

-- =====================================================

-- 12. Test search performance (should use index)
EXPLAIN ANALYZE
SELECT *
FROM events
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'soccer')
  AND user_id = auth.uid()
LIMIT 10;

-- Look for "Index Scan using idx_events_name_search" in output
-- Query time should be < 10ms even with thousands of events

-- =====================================================

-- 13. Summary check - everything should pass
SELECT
  'Constraints Added' AS check_name,
  CASE WHEN COUNT(*) >= 2 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_constraint
WHERE conrelid = 'events'::regclass
  AND conname LIKE '%check%'

UNION ALL

SELECT
  'Indexes Created' AS check_name,
  CASE WHEN COUNT(*) >= 4 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_indexes
WHERE tablename IN ('events', 'venues')
  AND indexname LIKE 'idx_%'

UNION ALL

SELECT
  'Venues have user_id' AS check_name,
  CASE WHEN COUNT(*) = COUNT(user_id) THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM venues

UNION ALL

SELECT
  'RLS Policies Updated' AS check_name,
  CASE WHEN COUNT(*) >= 8 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM pg_policies
WHERE tablename IN ('events', 'venues')

UNION ALL

SELECT
  'Triggers Created' AS check_name,
  CASE WHEN COUNT(*) >= 2 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM information_schema.triggers
WHERE event_object_table IN ('events', 'venues')

UNION ALL

SELECT
  'Functions Created' AS check_name,
  CASE WHEN COUNT(*) >= 3 THEN '✅ PASS' ELSE '❌ FAIL' END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_event_with_venues',
    'update_updated_at_column',
    'sync_venue_user_id'
  );

-- All checks should show ✅ PASS
