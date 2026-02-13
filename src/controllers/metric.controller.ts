import { Request, Response, NextFunction } from 'express';
import { createMetricSchema } from '../schemas/metric.schema';
import { AppError } from '../utils/AppError';
import { prisma } from '../utils/prisma';

export const createMetric = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { memberId } = req.params;
        const data = createMetricSchema.parse(req.body);

        // Temporal Check for Weight
        if (data.type === 'weight') {
            const lastWeight = await prisma.healthMetric.findFirst({
                where: {
                    memberId,
                    type: 'weight',
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            });

            if (lastWeight) {
                const now = new Date();
                const lastTime = new Date(lastWeight.recordedAt);
                const diffHours = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);

                if (diffHours < 24) {
                    const diffValue = Math.abs(data.value - lastWeight.value);
                    if (diffValue > 5) {
                        throw new AppError('Weight cannot change by more than 5kg in 24 hours', 400, {
                            field: 'value',
                            rule: 'temporal_delta',
                            value: data.value,
                        });
                    }
                }
            }
        }

        if (data.type === 'systolic_bp') {
            const lastDiastolic = await prisma.healthMetric.findFirst({
                where: {
                    memberId,
                    type: 'diastolic_bp',
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            });

            if (lastDiastolic && data.value <= lastDiastolic.value) {
                throw new AppError('Systolic BP must be greater than diastolic BP', 400, {
                    field: 'value',
                    rule: 'bp_consistency',
                    value: data.value,
                });
            }
        }

        if (data.type === 'diastolic_bp') {
            const lastSystolic = await prisma.healthMetric.findFirst({
                where: {
                    memberId,
                    type: 'systolic_bp',
                },
                orderBy: {
                    recordedAt: 'desc',
                },
            });

            if (lastSystolic && data.value >= lastSystolic.value) {
                throw new AppError('Diastolic BP must be less than systolic BP', 400, {
                    field: 'value',
                    rule: 'bp_consistency',
                    value: data.value,
                });
            }
        }

        const metric = await prisma.healthMetric.create({
            data: {
                memberId,
                type: data.type,
                value: data.value,
            },
        });

        res.status(201).json(metric);
    } catch (error) {
        next(error);
    }
};
