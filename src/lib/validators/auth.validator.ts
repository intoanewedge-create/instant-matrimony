import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),

    email: z.string().email("Invalid email address"),

    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpRequestSchema = z.object({
  target: z.string().min(1, "Target is required"),
  purpose: z.enum([
    "EMAIL_VERIFICATION",
    "PHONE_VERIFICATION",
    "PASSWORD_RESET",
  ]),
  type: z.enum(["email", "sms"]),
});

export const otpVerifySchema = z.object({
  target: z.string().min(1, "Target is required"),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
  purpose: z.enum([
    "EMAIL_VERIFICATION",
    "PHONE_VERIFICATION",
    "PASSWORD_RESET",
  ]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),

  code: z.string().length(6, "Verification code must be exactly 6 digits"),

  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  passwordOld: z.string().min(1, "Current password is required"),

  passwordNew: passwordSchema,
});
