import type { GymId, MemberId, TrainerId, WorkoutId } from './ids';

export type MembershipTier = 'basic' | 'premium' | 'elite';

export type Gym = {
    id: GymId;
    name: string;
    capacity: number;
    address: {
        street: string;
        city: string;
        country: string;
    };
};

export type TrainerCertification = {
    name: string;
    expiry: string;
};

export type Trainer = {
    id: TrainerId;
    name: string;
    certifications: TrainerCertification[];
};

export type Member = {
    id: MemberId;
    name: string;
    gymId: GymId;
    membershipTier: MembershipTier;
};

export type Workout = {
    id: WorkoutId;
    memberId: MemberId;
};

export type StrengthExercise = {
    type: 'strength';
    data: {
        reps: number;
        sets: number;
        weight?: number;
    };
};

export type CardioExercise = {
    type: 'cardio';
    data: {
        duration: number;
        distance?: number;
        calories?: number;
    };
};

export type Exercise = StrengthExercise | CardioExercise;
