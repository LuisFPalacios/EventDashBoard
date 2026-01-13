-- Easy Seed Data Script
-- This version automatically uses your user ID
-- Just run this entire script in Supabase SQL Editor after logging into your app at least once

-- This will use the first user in your database (your account)
DO $$
DECLARE
  v_user_id UUID;
  v_event_id UUID;
BEGIN
  -- Get the first user ID (should be you)
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please sign up in the app first.';
  END IF;

  RAISE NOTICE 'Using user ID: %', v_user_id;

  -- Insert Soccer Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Youth Soccer Championship Finals', 'Soccer', '2026-02-15 14:00:00+00', 'Annual youth soccer championship featuring top teams from the region. Come support local talent!')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Riverside Soccer Complex', '1234 River Road, Springfield, IL 62701'),
    (v_event_id, 'Alternative Field - Eastside Park', '5678 East Ave, Springfield, IL 62702');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Community Soccer League - Week 5', 'Soccer', '2026-01-20 18:30:00+00', 'Weekly community league match. All skill levels welcome.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Memorial Park Soccer Fields', '910 Memorial Drive, Springfield, IL 62703');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'International Friendly Match', 'Soccer', '2026-03-10 19:00:00+00', 'Special exhibition match between two international teams.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'City Stadium', '100 Stadium Way, Springfield, IL 62704');

  -- Insert Basketball Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'High School Basketball Tournament', 'Basketball', '2026-01-25 16:00:00+00', 'Regional high school basketball tournament semifinals.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Lincoln High School Gymnasium', '2000 School Street, Springfield, IL 62705'),
    (v_event_id, 'Washington High School Gym', '2100 Washington Blvd, Springfield, IL 62706');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, '3-on-3 Street Basketball Championship', 'Basketball', '2026-02-08 12:00:00+00', 'Urban street basketball competition with cash prizes.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Downtown Street Courts', 'Main Street & 5th Ave, Springfield, IL 62707');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'College Basketball Showcase', 'Basketball', '2026-02-28 18:00:00+00', 'Top college teams compete in this season showcase event.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'University Arena', '500 College Ave, Springfield, IL 62708');

  -- Insert Tennis Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'City Tennis Open 2026', 'Tennis', '2026-03-05 09:00:00+00', 'Annual city-wide tennis tournament. Singles and doubles categories.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Springfield Tennis Club', '300 Tennis Lane, Springfield, IL 62709'),
    (v_event_id, 'Backup Courts - Sunset Park', '400 Sunset Blvd, Springfield, IL 62710');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Junior Tennis Development Camp', 'Tennis', '2026-01-30 10:00:00+00', 'Week-long tennis camp for junior players ages 10-16.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Youth Sports Complex', '600 Youth Drive, Springfield, IL 62711');

  -- Insert Baseball Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Little League Opening Day', 'Baseball', '2026-04-01 10:00:00+00', 'Ceremonial opening day for the little league season.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Little League Park', '700 Diamond Street, Springfield, IL 62712');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Amateur Baseball League Finals', 'Baseball', '2026-04-15 13:00:00+00', 'Championship game of the amateur baseball league.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Veterans Memorial Field', '800 Veterans Way, Springfield, IL 62713');

  -- Insert Volleyball Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Beach Volleyball Summer Classic', 'Volleyball', '2026-06-20 11:00:00+00', 'Annual beach volleyball tournament at the coast.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Coastal Beach Courts', '1000 Beach Road, Oceanside, CA 92054'),
    (v_event_id, 'North Beach Volleyball Area', '1100 North Beach Dr, Oceanside, CA 92055');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Indoor Volleyball League Championship', 'Volleyball', '2026-03-22 17:00:00+00', 'Final match of the indoor volleyball season.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Sports Arena Complex', '1200 Arena Blvd, Springfield, IL 62714');

  -- Insert Football Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Youth Football All-Star Game', 'Football', '2026-05-10 15:00:00+00', 'Best youth football players compete in this exhibition game.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'County Stadium', '1300 County Road, Springfield, IL 62715');

  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Flag Football Tournament', 'Football', '2026-04-05 09:00:00+00', 'Non-contact flag football tournament for all ages.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Community Recreation Center', '1400 Recreation Way, Springfield, IL 62716'),
    (v_event_id, 'Practice Field #2', '1401 Recreation Way, Springfield, IL 62716');

  -- Insert Swimming Events
  INSERT INTO events (user_id, name, sport_type, date_time, description)
  VALUES
    (v_user_id, 'Regional Swimming Championships', 'Swimming', '2026-07-12 08:00:00+00', 'Olympic-style swimming competition featuring all strokes and distances.')
    RETURNING id INTO v_event_id;
  INSERT INTO venues (event_id, name, address) VALUES
    (v_event_id, 'Aquatic Center', '1500 Pool Plaza, Springfield, IL 62717');

  RAISE NOTICE 'Successfully created sample events and venues!';
END $$;

-- Check what was created
SELECT
  sport_type,
  COUNT(*) as event_count
FROM events
GROUP BY sport_type
ORDER BY event_count DESC;

SELECT
  COUNT(*) as total_events,
  (SELECT COUNT(*) FROM venues) as total_venues
FROM events;
