-- Gym Capacity Check
ALTER TABLE "gyms" ADD CONSTRAINT "capacity_check" CHECK (capacity > 0);

-- Health Metrics Bounds Check
ALTER TABLE "health_metrics" ADD CONSTRAINT "heart_rate_check" CHECK (type <> 'heart_rate' OR (value >= 30 AND value <= 220));

-- Exercise Polymorphic Data Check
ALTER TABLE "exercises" ADD CONSTRAINT "exercise_data_check" CHECK (
  (type = 'strength' AND data ? 'reps' AND data ? 'sets') OR
  (type = 'cardio' AND data ? 'duration') OR
  (type NOT IN ('strength', 'cardio'))
);
