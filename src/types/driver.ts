import { z } from 'zod';

export const VEHICLE_TYPES = ['ACE', 'Bolero/PickUp'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const DRIVER_TYPES = ['permanent', 'replacement'] as const;
export type DriverType = (typeof DRIVER_TYPES)[number];

export interface Driver {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  upiId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  routeId: string;
  dailyRate: number;
  driverType: DriverType;
  replacementForDriverId: string | null;
  createdAt: string;
  isActive: boolean;
}

export type DriverDraft = Omit<Driver, 'id' | 'ownerId' | 'createdAt'>;

export const driverFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    upiId: z
      .string()
      .trim()
      .refine(
        value => value.length === 0 || /^[\w.-]+@[a-zA-Z]+$/.test(value),
        'Enter a valid UPI ID, e.g. name@bank',
      ),
    vehicleNumber: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'Enter a valid 4-digit vehicle number'),
    vehicleType: z.enum(VEHICLE_TYPES),
    routeId: z.string().min(1, 'Route is required'),
    dailyRate: z
      .string()
      .trim()
      .min(1, 'Rate is required')
      .refine(value => Number.isFinite(Number(value)) && Number(value) > 0, {
        message: 'Enter a valid rate',
      }),
    driverType: z.enum(DRIVER_TYPES),
    replacementForDriverId: z.string().nullable(),
  })
  .refine(
    data =>
      data.driverType !== 'replacement' ||
      (data.replacementForDriverId !== null &&
        data.replacementForDriverId.length > 0),
    {
      message: 'Select which driver this replaces',
      path: ['replacementForDriverId'],
    },
  );

export type DriverFormValues = z.infer<typeof driverFormSchema>;
