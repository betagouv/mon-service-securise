import { z } from 'zod';

export const schemaPostCleApi = () => ({
  dureeValiditeEnJours: z.union([z.literal(30), z.literal(60), z.literal(90)]),
});

export const schemaDeleteCleApi = () => ({
  id: z.uuid(),
});
