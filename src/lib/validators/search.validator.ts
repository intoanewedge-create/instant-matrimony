import { z } from "zod";

const cleanString = (val: any) => (typeof val === "string" && val.trim() === "" ? undefined : val);
const cleanNumber = (min?: number, max?: number) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, min !== undefined && max !== undefined ? z.number().min(min).max(max).optional() : z.number().optional());

export const searchFilterSchema = z.object({
  gender: z.preprocess(cleanString, z.string().optional()),
  minAge: cleanNumber(18, 100),
  maxAge: cleanNumber(18, 100),
  minHeight: cleanNumber(100, 250),
  maxHeight: cleanNumber(100, 250),
  minWeight: cleanNumber(30, 300),
  maxWeight: cleanNumber(30, 300),
  maritalStatus: z.preprocess(cleanString, z.string().optional()),
  religion: z.preprocess(cleanString, z.string().optional()),
  caste: z.preprocess(cleanString, z.string().optional()),
  subCaste: z.preprocess(cleanString, z.string().optional()),
  gothram: z.preprocess(cleanString, z.string().optional()),
  motherTongue: z.preprocess(cleanString, z.string().optional()),
  education: z.preprocess(cleanString, z.string().optional()),
  occupation: z.preprocess(cleanString, z.string().optional()),
  minIncome: cleanNumber(0),
  maxIncome: cleanNumber(0),
  country: z.preprocess(cleanString, z.string().optional()),
  state: z.preprocess(cleanString, z.string().optional()),
  district: z.preprocess(cleanString, z.string().optional()),
  city: z.preprocess(cleanString, z.string().optional()),
  smoking: z.preprocess(cleanString, z.string().optional()),
  drinking: z.preprocess(cleanString, z.string().optional()),
  food: z.preprocess(cleanString, z.string().optional()),
  isVerified: z.preprocess((val) => val === true || val === "true", z.boolean().optional()),
  hasPhoto: z.preprocess((val) => val === true || val === "true", z.boolean().optional()),
  recentlyJoined: z.preprocess((val) => val === true || val === "true", z.boolean().optional()),
  recentlyActive: z.preprocess((val) => val === true || val === "true", z.boolean().optional()),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().min(1)).optional(),
  limit: z.preprocess((val) => (val ? Number(val) : 12), z.number().min(1).max(50)).optional(),
  profilePublicId: z.preprocess(cleanString, z.string().optional()),
  category: z.preprocess(cleanString, z.string().optional()),
  sortBy: z.preprocess(cleanString, z.enum(["bestMatch", "recentlyJoined", "recentlyActive", "age", "height"]).optional()),
});
