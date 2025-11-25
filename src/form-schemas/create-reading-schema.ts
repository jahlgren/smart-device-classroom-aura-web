import z from 'zod';

export const CreateReadingSchema = z.object({
  type: z.string(),
  value: z.int()
});

export type CreateReadingInput = z.infer<typeof CreateReadingSchema>;