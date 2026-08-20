import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional(),
});

export const step2Schema = z.object({
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .transform((val) => new Date(val)),
  height: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(100, "Height must be at least 100 cm")
      .max(250, "Height must be under 250 cm"),
  ),
  weight: z
    .preprocess((val) => (val ? Number(val) : undefined), z.number().min(30).max(300))
    .optional(),
  maritalStatus: z.string().min(1, "Marital status is required"),
});

export const step3Schema = z.object({
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  gothram: z.string().optional(),
  motherTongue: z.string().min(1, "Mother tongue is required"),
  horoscope: z.string().optional(),
});

export const step4Schema = z.object({
  education: z.string().min(1, "Education level is required"),
  occupation: z.string().min(1, "Occupation is required"),
  income: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Income must be positive"),
  ),
});

export const step5Schema = z.object({
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
});

export const step6Schema = z.object({
  familyDetails: z.string().optional(),
  familyValues: z.string().optional(),
  smoking: z.string().optional(),
  drinking: z.string().optional(),
  foodPreference: z.string().optional(),
  bio: z.string().optional(),
});

export const step7Schema = z.object({
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(1000, "Bio must not exceed 1000 characters"),
});

export const step8Schema = z.object({
  minAge: z
    .preprocess((val: any) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().min(18, "Minimum partner age must be at least 18").max(100, "Maximum partner age must be under 100").optional())
    .optional(),
  maxAge: z
    .preprocess((val: any) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().min(18, "Maximum partner age must be at least 18").max(100, "Maximum partner age must be under 100").optional())
    .optional(),
  minHeight: z
    .preprocess((val: any) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be under 250 cm").optional())
    .optional(),
  maxHeight: z
    .preprocess((val: any) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be under 250 cm").optional())
    .optional(),
  maritalStatus: z.string().optional(),
  religion: z.string().optional(),
  motherTongue: z.string().optional(),
  education: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  submitForReview: z.boolean().optional(),
});

export const partnerPreferenceSchema = step8Schema;

export const step9Schema = z.object({
  photosAcknowledged: z.boolean().optional(),
});

export const step10Schema = z.object({
  submitForReview: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  gender: z.string().optional(),
  dateOfBirth: z.preprocess((val: any) => {
    if (typeof val === "string" || val instanceof Date) return new Date(val);
    return val;
  }, z.date().optional()),

  religion: z.string().optional(),
  motherTongue: z.string().optional(),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  gothram: z.string().optional(),

  height: z.preprocess((val: any) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(50).max(300).optional()),
  weight: z
    .preprocess((val) => (val ? Number(val) : undefined), z.number().min(30).max(300))
    .optional(),
  maritalStatus: z.string().optional(),

  education: z.string().optional(),
  occupation: z.string().optional(),
  income: z.preprocess((val: any) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().min(0).max(100000000).optional()),

  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  bio: z.string().optional(),

  // Family & lifestyle fields
  familyValues: z.string().optional(),
  familyDetails: z.string().optional(),
  horoscope: z.string().optional(),
  smoking: z.string().optional(),
  drinking: z.string().optional(),
  foodPreference: z.string().optional(),
});
