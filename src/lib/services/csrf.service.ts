import crypto from "crypto";
import { BaseService } from "./base.service";
import { Result } from "../result";
import { loggerService } from "./logger.service";

export class CsrfService extends BaseService {
  private secret = process.env.AUTH_SECRET || "csrf-secret-fallback-key-32-chars-long";

  generateToken(): { token: string; cookieValue: string } {
    const salt = crypto.randomBytes(16).toString("hex");
    const token = this.createToken(salt);
    
    return {
      token,
      cookieValue: salt,
    };
  }

  private createToken(salt: string): string {
    const hmac = crypto.createHmac("sha256", this.secret);
    hmac.update(salt);
    return `${salt}.${hmac.digest("hex")}`;
  }

  validateToken(token: string | null, cookieSalt: string | null): Result<boolean> {
    if (!token || !cookieSalt) {
      return this.returnFailure("CSRF token or session salt is missing.", "CSRF_MISSING");
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 2) {
        return this.returnFailure("Invalid CSRF token format.", "CSRF_INVALID_FORMAT");
      }

      const [tokenSalt] = parts;
      if (tokenSalt !== cookieSalt) {
        return this.returnFailure("CSRF token salt mismatch.", "CSRF_MISMATCH");
      }

      const expectedToken = this.createToken(tokenSalt);
      if (expectedToken !== token) {
        return this.returnFailure("CSRF signature validation failed.", "CSRF_INVALID_SIGNATURE");
      }

      return this.returnSuccess(true);
    } catch (e: any) {
      loggerService.error("CSRF check failed", {}, e);
      return this.returnFailure("CSRF validation error.", "CSRF_ERROR");
    }
  }

  getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 3600 * 2, // 2 hours
    };
  }
}
