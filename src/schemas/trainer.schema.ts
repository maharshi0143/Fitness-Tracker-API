import { z } from 'zod';

export const assignTrainerSchema = z.object({
    gymId: z.string().min(1, "Gym ID is required"),
});

export type AssignTrainerInput = z.infer<typeof assignTrainerSchema>;
