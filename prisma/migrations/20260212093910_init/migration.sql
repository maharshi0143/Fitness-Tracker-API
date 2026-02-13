-- CreateTable
CREATE TABLE "gyms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "address" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certifications" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_assignments" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gymId" TEXT NOT NULL,
    "membershipTier" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_metrics" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gyms_name_key" ON "gyms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_assignments_trainerId_gymId_key" ON "trainer_assignments"("trainerId", "gymId");

-- AddCheck
ALTER TABLE "gyms" ADD CONSTRAINT "gyms_capacity_check" CHECK ("capacity" > 0);

-- AddCheck
ALTER TABLE "members" ADD CONSTRAINT "members_membership_tier_check" CHECK ("membershipTier" IN ('basic', 'premium', 'elite'));

-- AddCheck
ALTER TABLE "health_metrics" ADD CONSTRAINT "health_metrics_bounds_check" CHECK (
    ("type" = 'heart_rate' AND "value" BETWEEN 30 AND 220)
    OR ("type" = 'weight' AND "value" > 0 AND "value" < 500)
    OR ("type" = 'systolic_bp' AND "value" BETWEEN 70 AND 250)
    OR ("type" = 'diastolic_bp' AND "value" BETWEEN 40 AND 150)
);

-- Enforce systolic/diastolic consistency at the database layer
CREATE OR REPLACE FUNCTION enforce_bp_consistency()
RETURNS TRIGGER AS $$
DECLARE
    last_diastolic DOUBLE PRECISION;
    last_systolic DOUBLE PRECISION;
BEGIN
    IF NEW."type" = 'systolic_bp' THEN
        SELECT "value" INTO last_diastolic
        FROM "health_metrics"
        WHERE "memberId" = NEW."memberId" AND "type" = 'diastolic_bp'
        ORDER BY "recordedAt" DESC
        LIMIT 1;

        IF last_diastolic IS NOT NULL AND NEW."value" <= last_diastolic THEN
            RAISE EXCEPTION 'Systolic BP must be greater than diastolic BP';
        END IF;
    ELSIF NEW."type" = 'diastolic_bp' THEN
        SELECT "value" INTO last_systolic
        FROM "health_metrics"
        WHERE "memberId" = NEW."memberId" AND "type" = 'systolic_bp'
        ORDER BY "recordedAt" DESC
        LIMIT 1;

        IF last_systolic IS NOT NULL AND NEW."value" >= last_systolic THEN
            RAISE EXCEPTION 'Diastolic BP must be less than systolic BP';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_metrics_bp_check
BEFORE INSERT OR UPDATE ON "health_metrics"
FOR EACH ROW EXECUTE FUNCTION enforce_bp_consistency();

-- AddCheck
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_type_data_check" CHECK (
    jsonb_typeof("data") = 'object' AND (
        ("type" = 'strength'
            AND "data" ? 'reps'
            AND "data" ? 'sets'
            AND jsonb_typeof("data"->'reps') = 'number'
            AND jsonb_typeof("data"->'sets') = 'number'
            AND NOT "data" ? 'duration'
        )
        OR
        ("type" = 'cardio'
            AND "data" ? 'duration'
            AND jsonb_typeof("data"->'duration') = 'number'
            AND NOT "data" ? 'reps'
            AND NOT "data" ? 'sets'
        )
    )
);

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_assignments" ADD CONSTRAINT "trainer_assignments_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_metrics" ADD CONSTRAINT "health_metrics_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
