import { z } from 'zod';

export interface Route {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  createdAt: string;
}

export type RouteDraft = Omit<Route, 'id' | 'ownerId' | 'createdAt'>;

export const routeFormSchema = z.object({
  name: z.string().trim().min(1, 'Route name is required'),
  description: z.string().trim().min(1, 'Description is required'),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;
