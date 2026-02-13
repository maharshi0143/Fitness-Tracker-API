import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createGymSchema } from '../schemas/gym.schema';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const createGym = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Runtime validation
        const data = createGymSchema.parse(req.body);

        // Database interaction
        const gym = await prisma.gym.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                address: data.address,
            },
        });

        res.status(201).json(gym);
    } catch (error) {
        next(error);
    }
};
