import { z } from 'zod';

export interface Route {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  fuelLitres: number;
  createdAt: string;
}

export type RouteDraft = Omit<Route, 'id' | 'ownerId' | 'createdAt'>;

export const routeFormSchema = z.object({
  name: z.string().trim().min(1, 'Route name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  fuelLitres: z
    .string()
    .trim()
    .min(1, 'Fuel amount is required')
    .refine(value => Number.isFinite(Number(value)) && Number(value) >= 0, {
      message: 'Enter a valid fuel amount',
    }),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;
