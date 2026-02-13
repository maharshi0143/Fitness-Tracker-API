import { Request, Response, NextFunction } from 'express';
import { assignTrainerSchema } from '../schemas/trainer.schema';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

export const assignTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trainerId } = req.params;
        const { gymId } = assignTrainerSchema.parse(req.body);

        const trainer = await prisma.trainer.findUnique({
            where: { id: trainerId },
            include: { assignments: true },
        });

        if (!trainer) {
            throw new AppError('Trainer not found', 404, {
                field: 'trainerId',
                rule: 'not_found',
                value: trainerId,
            });
        }

        // 1. Check for expired certifications
        // Defined as: "The trainer has an expired certification relevant to the assignment."
        // Simplified: If ANY certification is expired (or create logic to check specific ones).
        // Assuming certifications is an array of objects { name: string, expiry: string (ISO date) }
        const certifications = trainer.certifications as Array<{ name: string; expiry: string }>;
        const now = new Date();

        const hasExpiredCert = certifications.some(cert => new Date(cert.expiry) < now);
        if (hasExpiredCert) {
            throw new AppError('Trainer has expired certification(s)', 400, {
                field: 'certifications',
                rule: 'certification_valid',
                value: 'expired',
            });
        }

        // 2. Check assignment limits
        // "1 for basic, 3 for advanced".
        // Infer level: if any certification contains "Advanced", limit is 3, else 1.
        const isAdvanced = certifications.some(cert => cert.name.toLowerCase().includes('advanced'));
        const limit = isAdvanced ? 3 : 1;

        if (trainer.assignments.length >= limit) {
            throw new AppError(`Trainer has reached maximum assignment limit of ${limit}`, 400, {
                field: 'assignments',
                rule: 'assignment_limit',
                value: trainer.assignments.length,
            });
        }

        const gym = await prisma.gym.findUnique({ where: { id: gymId } });
        if (!gym) {
            throw new AppError('Gym not found', 404, {
                field: 'gymId',
                rule: 'not_found',
                value: gymId,
            });
        }

        // 3. Create Assignment
        // Check if gym exists first (optional with foreign key, but good for error message)
        // Prisma will throw P2003 if gym doesn't exist, which we catch in global handler.

        const assignment = await prisma.trainerAssignment.create({
            data: {
                trainerId,
                gymId,
            },
        });

        res.status(201).json(assignment);
    } catch (error) {
        next(error);
    }
};
