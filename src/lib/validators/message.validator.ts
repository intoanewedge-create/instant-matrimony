import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid("Invalid receiver ID"),
  content: z.string().min(1, "Message content cannot be empty").max(2000, "Message is too long"),
});
