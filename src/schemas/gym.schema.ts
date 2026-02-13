import { z } from 'zod';

export const createGymSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    capacity: z.number().int().positive("Capacity must be a positive integer"),
    address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        country: z.string().min(1, "Country is required"),
    }),
});

export type CreateGymInput = z.infer<typeof createGymSchema>;
