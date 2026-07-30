import { z } from "zod";

export const sendInterestSchema = z.object({
  receiverId: z.string().uuid("Invalid user ID"),
});

export const respondInterestSchema = z.object({
  interestId: z.string().uuid("Invalid interest ID"),
  action: z.enum(["ACCEPT", "DECLINE"]),
});
