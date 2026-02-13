import { z } from 'zod';

export const createWorkoutSchema = z.object({
    memberId: z.string().min(1, 'Member ID is required'),
});

// Base schema for shared properties if any
const exerciseBase = z.object({});

const strengthExercise = exerciseBase.extend({
    type: z.literal('strength'),
    data: z.object({
        reps: z.number().int().positive(),
        sets: z.number().int().positive(),
        weight: z.number().nonnegative().optional(),
    }).strict(),
});

const cardioExercise = exerciseBase.extend({
    type: z.literal('cardio'),
    data: z.object({
        duration: z.number().positive(), // in minutes
        distance: z.number().positive().optional(), // in km
        calories: z.number().positive().optional(),
    }).strict(),
});

// Discriminated union for polymorphic validation
export const createExerciseSchema = z.discriminatedUnion('type', [
    strengthExercise,
    cardioExercise,
]);

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
