-- Seed Gyms
INSERT INTO "gyms" ("id", "name", "capacity", "address", "createdAt", "updatedAt")
VALUES
  ('gym_001', 'Downtown Fitness', 100, '{"street": "123 Main St", "city": "Metropolis", "country": "USA"}', NOW(), NOW()),
  ('gym_002', 'Uptown Gym', 50, '{"street": "456 High St", "city": "Metropolis", "country": "USA"}', NOW(), NOW());

-- Seed Trainers
INSERT INTO "trainers" ("id", "name", "certifications", "createdAt", "updatedAt")
VALUES
  ('trainer_001', 'John Doe', '[{"name": "Advanced Strength Coach", "expiry": "2027-12-31"}]', NOW(), NOW()),
  ('trainer_002', 'Jane Smith', '[{"name": "Yoga Instructor", "expiry": "2024-06-30"}]', NOW(), NOW());

-- Seed Members
INSERT INTO "members" ("id", "name", "gymId", "membershipTier", "joinedAt")
VALUES
  ('member_001', 'Alice Johnson', 'gym_001', 'basic', NOW()),
  ('member_002', 'Bob Williams', 'gym_002', 'premium', NOW());
