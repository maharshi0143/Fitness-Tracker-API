import { z } from 'zod';

export const createMetricSchema = z.object({
    type: z.enum(['heart_rate', 'weight', 'systolic_bp', 'diastolic_bp']),
    value: z.number(),
}).superRefine((data, ctx) => {
    if (data.type === 'heart_rate' && (data.value < 30 || data.value > 220)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Heart rate must be between 30 and 220 bpm',
            path: ['value'],
        });
    }

    if (data.type === 'weight' && data.value <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Weight must be greater than 0',
            path: ['value'],
        });
    }

    if (data.type === 'systolic_bp' && (data.value < 70 || data.value > 250)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Systolic BP must be between 70 and 250',
            path: ['value'],
        });
    }

    if (data.type === 'diastolic_bp' && (data.value < 40 || data.value > 150)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Diastolic BP must be between 40 and 150',
            path: ['value'],
        });
    }
});

export type CreateMetricInput = z.infer<typeof createMetricSchema>;
