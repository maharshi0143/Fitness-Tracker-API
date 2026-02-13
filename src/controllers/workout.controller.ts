import { Request, Response, NextFunction } from 'express';
import { createExerciseSchema, createWorkoutSchema } from '../schemas/workout.schema';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

export const createWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { memberId } = createWorkoutSchema.parse(req.body);
        const workout = await prisma.workout.create({
            data: { memberId }
        });
        res.status(201).json(workout);
    } catch (error) {
        next(error);
    }
}

export const addExercise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;
        const data = createExerciseSchema.parse(req.body);

        const workout = await prisma.workout.findUnique({
            where: { id: sessionId },
        });

        if (!workout) {
            throw new AppError('Workout session not found', 404, {
                field: 'sessionId',
                rule: 'not_found',
                value: sessionId,
            });
        }

        // Create Exercise
        // Prisma Json type handles the polymorphic structure.
        const exercise = await prisma.exercise.create({
            data: {
                workoutId: sessionId,
                type: data.type,
                data: data.data,
            },
        });

        res.status(201).json(exercise);
    } catch (error) {
        next(error);
    }
};
