export interface OtpProvider {
  sendOtp(target: string, code: string): Promise<void>;
}
