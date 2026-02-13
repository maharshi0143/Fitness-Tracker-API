import { Request, Response, NextFunction } from 'express';
import { enrollMemberSchema } from '../schemas/member.schema';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

export const enrollMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { memberId } = req.params;
        const { gymId, membershipTier } = enrollMemberSchema.parse(req.body);

        const enrollment = await prisma.$transaction(async (tx) => {
            const gym = await tx.gym.findUnique({ where: { id: gymId } });

            if (!gym) {
                throw new AppError('Gym not found', 404, {
                    field: 'gymId',
                    rule: 'not_found',
                    value: gymId,
                });
            }

            const existingMember = await tx.member.findUnique({ where: { id: memberId } });
            if (existingMember && existingMember.gymId === gymId) {
                throw new AppError('Member already enrolled in this gym', 400, {
                    field: 'memberId',
                    rule: 'already_enrolled',
                    value: memberId,
                });
            }

            const currentCount = await tx.member.count({ where: { gymId } });

            if (currentCount >= gym.capacity) {
                throw new AppError('Gym is at full capacity', 400, {
                    field: 'gymId',
                    rule: 'capacity',
                    value: gymId,
                });
            }

            return await tx.member.upsert({
                where: { id: memberId },
                update: {
                    gymId,
                    membershipTier,
                },
                create: {
                    id: memberId,
                    name: `Member ${memberId}`,
                    gymId,
                    membershipTier,
                },
            });
        });

        res.status(201).json(enrollment);
    } catch (error) {
        next(error);
    }
};
