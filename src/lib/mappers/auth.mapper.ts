import { User } from "@prisma/client";
import { AuthResponse } from "../dto/auth.dto";

export class AuthMapper {
  static toResponse(user: User): AuthResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
