import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                layer: 'runtime',
                errors: err.errors.map(e => ({
                    field: e.path.join('.') || 'unknown',
                    rule: e.code,
                    message: e.message,
                    value: (req.body && e.path.length > 0) ? req.body[e.path[0]] : 'unknown',
                })),
            },
        });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[]) || ['unknown'];
            return res.status(400).json({
                success: false,
                error: {
                    layer: 'database',
                    errors: [
                        {
                            field: target.join('.'),
                            rule: 'unique_constraint',
                            message: `Duplicate value for unique field(s): ${target.join(', ')}`,
                            value: 'unknown',
                        },
                    ],
                },
            });
        }

        // P2003: Foreign key constraint failed
        if (err.code === 'P2003') {
            return res.status(400).json({
                success: false,
                error: {
                    layer: 'database',
                    errors: [
                        {
                            field: err.meta?.field_name as string || 'unknown',
                            rule: 'foreign_key_constraint',
                            message: 'Referenced record not found.',
                            value: 'unknown',
                        },
                    ],
                },
            });
        }

        // P2004: Constraint failed on the database
        if (err.code === 'P2004') {
            return res.status(400).json({
                success: false,
                error: {
                    layer: 'database',
                    errors: [
                        {
                            field: (err.meta?.field_name as string) || 'unknown',
                            rule: 'check_constraint',
                            message: 'Database check constraint failed.',
                            value: 'unknown',
                        },
                    ],
                },
            });
        }

        // P2025: Record not found (e.g. from findUniqueOrThrow)
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: {
                    layer: 'database',
                    errors: [{
                        field: 'id',
                        rule: 'not_found',
                        message: 'Record not found.',
                        value: 'unknown'
                    }]
                }
            })
        }
    }

    // Handle custom AppErrors
    if (err instanceof AppError) {
        // All validation and business rule errors return 400, per the error contract
        const statusCode = err.layer === 'runtime' ? 400 : err.statusCode;
        return res.status(statusCode).json({
            success: false,
            error: {
                layer: err.layer,
                errors: [
                    {
                        field: err.field ?? 'unknown',
                        rule: err.rule ?? 'business_rule',
                        message: err.message,
                        value: err.value ?? 'unknown',
                    },
                ],
            },
        });
    }

    console.error('UNHANDLED ERROR:', err);
    return res.status(500).json({
        success: false,
        error: {
            layer: 'runtime',
            errors: [
                {
                    field: 'unknown',
                    rule: 'internal_error',
                    message: 'Internal Server Error',
                    value: 'unknown',
                },
            ],
        },
    });
};
