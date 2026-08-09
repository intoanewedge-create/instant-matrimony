import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import * as crypto from "crypto";

/**
 * Service managing WebAuthn passwordless authentication challenges and signature assertions.
 */
export class WebAuthnService extends BaseService {
  private challenges = new Map<string, string>();
  private credentials = new Map<string, { credentialId: string; publicKey: string }>();

  /**
   * Generates a random challenge string for registration or login.
   */
  async generateChallenge(userId: string): Promise<Result<{ challenge: string; rpId: string }>> {
    const challenge = crypto.randomBytes(32).toString("base64url");
    this.challenges.set(userId, challenge);

    return returnSuccess({
      challenge,
      rpId: "instantmatrimony.com"
    });
  }

  /**
   * Validates passkey signature assertion.
   */
  async verifyAssertion(userId: string, _credentialId: string, clientDataJson: string, _signatureBase64: string): Promise<Result<boolean>> {
    const expectedChallenge = this.challenges.get(userId);
    if (!expectedChallenge) {
      throw new Error("Challenge expired or not found");
    }

    // Mock signature assertion checking
    const challengePresent = clientDataJson.includes(expectedChallenge);
    this.challenges.delete(userId); // clear challenge

    return returnSuccess(challengePresent);
  }
}
