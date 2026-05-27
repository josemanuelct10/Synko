import { z } from 'zod';

export const documentIdParamSchema = z.object({
    id: z.string().uuid("Invalid document id")
});

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;