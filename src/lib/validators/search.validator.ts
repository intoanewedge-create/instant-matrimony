import { z } from "zod";

const numLike = (min: number, max: number) =>
  z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : Number(val),
    z.number().min(min).max(max).optional(),
  );

export const searchFiltersSchema = z.object({
  gender: z.string().optional(),
  minAge: numLike(18, 100),
  maxAge: numLike(18, 100),
  religion: z.string().optional(),
  caste: z.string().optional(),
  motherTongue: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  minIncome: z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : Number(val),
    z.number().min(0).optional(),
  ),
  // Additional filters — Prisma schema already supports these fields.
  education: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  minHeight: numLike(120, 250),
  maxHeight: numLike(120, 250),
  smoking: z.string().optional(),
  drinking: z.string().optional(),
  food: z.string().optional(),
});
