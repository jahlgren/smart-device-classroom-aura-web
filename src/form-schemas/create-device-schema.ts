import z from 'zod';

export const CreateDeviceSchema = z.object({
  id: z.string().length(6, "Device ID needs to be 6 characters long"),
  description: z.string().optional()
});

export type CreateDeviceInput = z.infer<typeof CreateDeviceSchema>;