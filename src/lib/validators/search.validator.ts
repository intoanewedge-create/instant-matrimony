import { z } from "zod";

export const searchFiltersSchema = z.object({
  gender: z.string().optional(),
  minAge: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(18).max(100).optional()),
  maxAge: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(18).max(100).optional()),
  religion: z.string().optional(),
  caste: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  minIncome: z.preprocess((val) => val ? Number(val) : undefined, z.number().min(0).optional()),
});
