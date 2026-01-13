-- Seed Data for Sports Event Management Application
-- Run this in your Supabase SQL Editor

-- Note: Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users
-- You can find your user ID by running: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- First, let's get your user ID (you'll need to replace this with actual user ID)
-- To find it: Go to Supabase Dashboard > Authentication > Users > Copy your user ID

-- Sample Events for Soccer
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Youth Soccer Championship Finals', 'Soccer', '2026-02-15 14:00:00+00', 'Annual youth soccer championship featuring top teams from the region. Come support local talent!', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'Community Soccer League - Week 5', 'Soccer', '2026-01-20 18:30:00+00', 'Weekly community league match. All skill levels welcome.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'International Friendly Match', 'Soccer', '2026-03-10 19:00:00+00', 'Special exhibition match between two international teams.', NOW(), NOW());

-- Sample Events for Basketball
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'High School Basketball Tournament', 'Basketball', '2026-01-25 16:00:00+00', 'Regional high school basketball tournament semifinals.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', '3-on-3 Street Basketball Championship', 'Basketball', '2026-02-08 12:00:00+00', 'Urban street basketball competition with cash prizes.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'College Basketball Showcase', 'Basketball', '2026-02-28 18:00:00+00', 'Top college teams compete in this season showcase event.', NOW(), NOW());

-- Sample Events for Tennis
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'City Tennis Open 2026', 'Tennis', '2026-03-05 09:00:00+00', 'Annual city-wide tennis tournament. Singles and doubles categories.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'Junior Tennis Development Camp', 'Tennis', '2026-01-30 10:00:00+00', 'Week-long tennis camp for junior players ages 10-16.', NOW(), NOW());

-- Sample Events for Baseball
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Little League Opening Day', 'Baseball', '2026-04-01 10:00:00+00', 'Ceremonial opening day for the little league season.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'Amateur Baseball League Finals', 'Baseball', '2026-04-15 13:00:00+00', 'Championship game of the amateur baseball league.', NOW(), NOW());

-- Sample Events for Volleyball
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Beach Volleyball Summer Classic', 'Volleyball', '2026-06-20 11:00:00+00', 'Annual beach volleyball tournament at the coast.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'Indoor Volleyball League Championship', 'Volleyball', '2026-03-22 17:00:00+00', 'Final match of the indoor volleyball season.', NOW(), NOW());

-- Sample Events for Football
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Youth Football All-Star Game', 'Football', '2026-05-10 15:00:00+00', 'Best youth football players compete in this exhibition game.', NOW(), NOW()),
  ('YOUR_USER_ID_HERE', 'Flag Football Tournament', 'Football', '2026-04-05 09:00:00+00', 'Non-contact flag football tournament for all ages.', NOW(), NOW());

-- Sample Events for Swimming
INSERT INTO events (user_id, name, sport_type, date_time, description, created_at, updated_at)
VALUES
  ('YOUR_USER_ID_HERE', 'Regional Swimming Championships', 'Swimming', '2026-07-12 08:00:00+00', 'Olympic-style swimming competition featuring all strokes and distances.', NOW(), NOW());

-- Now add venues for these events
-- Note: You'll need to get the actual event IDs after inserting events
-- You can find them by running: SELECT id, name FROM events ORDER BY created_at DESC;

-- Venues for Soccer Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'Youth Soccer Championship Finals'), 'Riverside Soccer Complex', '1234 River Road, Springfield, IL 62701', NOW()),
  ((SELECT id FROM events WHERE name = 'Youth Soccer Championship Finals'), 'Alternative Field - Eastside Park', '5678 East Ave, Springfield, IL 62702', NOW()),

  ((SELECT id FROM events WHERE name = 'Community Soccer League - Week 5'), 'Memorial Park Soccer Fields', '910 Memorial Drive, Springfield, IL 62703', NOW()),

  ((SELECT id FROM events WHERE name = 'International Friendly Match'), 'City Stadium', '100 Stadium Way, Springfield, IL 62704', NOW());

-- Venues for Basketball Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'High School Basketball Tournament'), 'Lincoln High School Gymnasium', '2000 School Street, Springfield, IL 62705', NOW()),
  ((SELECT id FROM events WHERE name = 'High School Basketball Tournament'), 'Washington High School Gym', '2100 Washington Blvd, Springfield, IL 62706', NOW()),

  ((SELECT id FROM events WHERE name = '3-on-3 Street Basketball Championship'), 'Downtown Street Courts', 'Main Street & 5th Ave, Springfield, IL 62707', NOW()),

  ((SELECT id FROM events WHERE name = 'College Basketball Showcase'), 'University Arena', '500 College Ave, Springfield, IL 62708', NOW());

-- Venues for Tennis Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'City Tennis Open 2026'), 'Springfield Tennis Club', '300 Tennis Lane, Springfield, IL 62709', NOW()),
  ((SELECT id FROM events WHERE name = 'City Tennis Open 2026'), 'Backup Courts - Sunset Park', '400 Sunset Blvd, Springfield, IL 62710', NOW()),

  ((SELECT id FROM events WHERE name = 'Junior Tennis Development Camp'), 'Youth Sports Complex', '600 Youth Drive, Springfield, IL 62711', NOW());

-- Venues for Baseball Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'Little League Opening Day'), 'Little League Park', '700 Diamond Street, Springfield, IL 62712', NOW()),

  ((SELECT id FROM events WHERE name = 'Amateur Baseball League Finals'), 'Veterans Memorial Field', '800 Veterans Way, Springfield, IL 62713', NOW());

-- Venues for Volleyball Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'Beach Volleyball Summer Classic'), 'Coastal Beach Courts', '1000 Beach Road, Oceanside, CA 92054', NOW()),
  ((SELECT id FROM events WHERE name = 'Beach Volleyball Summer Classic'), 'North Beach Volleyball Area', '1100 North Beach Dr, Oceanside, CA 92055', NOW()),

  ((SELECT id FROM events WHERE name = 'Indoor Volleyball League Championship'), 'Sports Arena Complex', '1200 Arena Blvd, Springfield, IL 62714', NOW());

-- Venues for Football Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'Youth Football All-Star Game'), 'County Stadium', '1300 County Road, Springfield, IL 62715', NOW()),

  ((SELECT id FROM events WHERE name = 'Flag Football Tournament'), 'Community Recreation Center', '1400 Recreation Way, Springfield, IL 62716', NOW()),
  ((SELECT id FROM events WHERE name = 'Flag Football Tournament'), 'Practice Field #2', '1401 Recreation Way, Springfield, IL 62716', NOW());

-- Venues for Swimming Events
INSERT INTO venues (event_id, name, address, created_at)
VALUES
  ((SELECT id FROM events WHERE name = 'Regional Swimming Championships'), 'Aquatic Center', '1500 Pool Plaza, Springfield, IL 62717', NOW());

-- Verification queries (run these after to check your data)
-- SELECT COUNT(*) as total_events FROM events;
-- SELECT COUNT(*) as total_venues FROM venues;
-- SELECT sport_type, COUNT(*) as count FROM events GROUP BY sport_type ORDER BY count DESC;
