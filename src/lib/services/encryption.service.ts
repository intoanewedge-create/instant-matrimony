import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import * as crypto from "crypto";

/**
 * Service providing envelope encryption and field-level PII tokenization.
 */
export class EncryptionService extends BaseService {
  private masterKey = crypto.randomBytes(32);

  /**
   * Encrypts plaintext value using envelope encryption.
   */
  async encryptField(plaintext: string): Promise<Result<{ ciphertext: string; keyId: string }>> {
    // Generate a data key
    const dataKey = crypto.randomBytes(32);
    
    // Encrypt the plaintext using the data key
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", dataKey, iv);
    let ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");

    // Encrypt data key using the master key (Envelope encryption simulation)
    const masterCipher = crypto.createCipheriv("aes-256-cbc", this.masterKey, iv);
    let encryptedDataKey = masterCipher.update(dataKey.toString("hex"), "utf8", "hex");
    encryptedDataKey += masterCipher.final("hex");

    return returnSuccess({
      ciphertext: `${iv.toString("hex")}:${encryptedDataKey}:${ciphertext}`,
      keyId: "kms-master-v1"
    });
  }

  /**
   * Decrypts ciphertext using envelope key resolution.
   */
  async decryptField(wrappedCiphertext: string): Promise<Result<string>> {
    const parts = wrappedCiphertext.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedDataKey = parts[1];
    const ciphertext = parts[2];

    // Decrypt the data key
    const masterDecipher = crypto.createDecipheriv("aes-256-cbc", this.masterKey, iv);
    let decryptedDataKeyHex = masterDecipher.update(encryptedDataKey, "hex", "utf8");
    decryptedDataKeyHex += masterDecipher.final("utf8");

    const dataKey = Buffer.from(decryptedDataKeyHex, "hex");

    // Decrypt plaintext
    const decipher = crypto.createDecipheriv("aes-256-cbc", dataKey, iv);
    let plaintext = decipher.update(ciphertext, "hex", "utf8");
    plaintext += decipher.final("utf8");

    return returnSuccess(plaintext);
  }

  /**
   * Tokenizes sensitive fields to support masking or pseudonymization.
   */
  async tokenize(value: string): Promise<Result<string>> {
    const hash = crypto.createHash("sha256").update(value).digest("hex");
    return returnSuccess(`TOK_${hash.substring(0, 16).toUpperCase()}`);
  }
}
