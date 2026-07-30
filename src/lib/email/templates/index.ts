const brandColor = "#be123c"; // rose-700
const brandBg = "#fff1f2";    // rose-50
const textColor = "#1e293b";  // slate-800
const cardBg = "#ffffff";
const footerColor = "#64748b"; // slate-500

function wrapLayout(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: ${textColor};
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: ${cardBg};
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          }
          .header {
            background-color: ${brandBg};
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #ffe4e6;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: ${brandColor};
            text-decoration: none;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: ${footerColor};
            border-top: 1px solid #e2e8f0;
          }
          .btn {
            display: inline-block;
            background-color: ${brandColor};
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
          }
          .otp-box {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: ${brandColor};
            background-color: ${brandBg};
            border: 1px dashed #f43f5e;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">InstantMatrimony</a>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            &copy; 2026 InstantMatrimony. All rights reserved.<br>
            If you have any questions, please contact our support team.
          </div>
        </div>
      </body>
    </html>
  `;
}

export const welcomeTemplate = (name: string) => wrapLayout(
  "Welcome to InstantMatrimony",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Namaste ${name},</h1>
    <p>Welcome to InstantMatrimony, the premium matchmaking platform built for serious relationships. We are thrilled to help you find your life partner.</p>
    <p>Get started by completing your profile onboarding. Profiles with 100% completion receive up to 5x more matching interactions.</p>
    <a href="#" class="btn">Complete Your Profile</a>
  `
);

export const verifyEmailTemplate = (name: string, otp: string) => wrapLayout(
  "Verify your Email Address",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Verify Your Email</h1>
    <p>Dear ${name},</p>
    <p>Please use the following One-Time Password (OTP) code to complete your email verification process. This code is valid for 10 minutes.</p>
    <div style="text-align: center;">
      <div class="otp-box">${otp}</div>
    </div>
    <p>If you did not initiate this request, please change your password immediately.</p>
  `
);

export const verifyPhoneTemplate = (name: string, otp: string) => wrapLayout(
  "Verify your Phone Number",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Verify Your Phone</h1>
    <p>Dear ${name},</p>
    <p>Please use the following One-Time Password (OTP) code to complete your phone verification process. This code is valid for 10 minutes.</p>
    <div style="text-align: center;">
      <div class="otp-box">${otp}</div>
    </div>
  `
);

export const forgotPasswordTemplate = (name: string, otp: string) => wrapLayout(
  "Reset Your Password",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Password Reset Request</h1>
    <p>Dear ${name},</p>
    <p>We received a request to reset your password. Use the following code to proceed. This code is valid for 10 minutes.</p>
    <div style="text-align: center;">
      <div class="otp-box">${otp}</div>
    </div>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `
);

export const resetPasswordTemplate = (name: string) => wrapLayout(
  "Password Changed Successfully",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Password Changed</h1>
    <p>Dear ${name},</p>
    <p>This is a confirmation that your account password was changed successfully.</p>
    <p>If you did not perform this change, please contact our administrator immediately or block your account.</p>
  `
);

export const interestReceivedTemplate = (name: string, senderName: string) => wrapLayout(
  "New Interest Received",
  `
    <h1 style="margin-top: 0; color: #0f172a;">New Connection Request</h1>
    <p>Dear ${name},</p>
    <p>Great news! <strong>${senderName}</strong> has sent you an interest request on InstantMatrimony.</p>
    <p>Log in to your member dashboard to view their profile, check compatibility, and respond to their request.</p>
    <a href="#" class="btn">View Interest Request</a>
  `
);

export const membershipPurchasedTemplate = (name: string, planName: string, amount: number, expiryDays: number) => wrapLayout(
  "Membership Upgrade Confirmed",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Thank you for your purchase!</h1>
    <p>Dear ${name},</p>
    <p>Your subscription to the <strong>${planName}</strong> plan has been activated successfully.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: 600; color: #475569;">Plan Name</td>
        <td style="padding: 10px 0; text-align: right;">${planName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: 600; color: #475569;">Amount Paid</td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold; color: ${brandColor};">₹${amount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 600; color: #475569;">Validity</td>
        <td style="padding: 10px 0; text-align: right;">${expiryDays} Days</td>
      </tr>
    </table>
    <p>You can now enjoy all the premium features, direct messaging, and advanced compatibility insights.</p>
    <a href="#" class="btn">Explore Premium Matches</a>
  `
);

export const profileApprovedTemplate = (name: string) => wrapLayout(
  "Profile Approved",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Your Profile is Approved!</h1>
    <p>Dear ${name},</p>
    <p>Congratulations! Our moderation team has reviewed and approved your InstantMatrimony profile.</p>
    <p>Your profile is now visible to other members. You can start sending interests and exploring suggested matches immediately.</p>
    <a href="#" class="btn">Go to Dashboard</a>
  `
);

export const profileRejectedTemplate = (name: string, reason: string) => wrapLayout(
  "Profile Changes Requested",
  `
    <h1 style="margin-top: 0; color: #0f172a;">Profile Status Update</h1>
    <p>Dear ${name},</p>
    <p>Our moderation team reviewed your profile and noticed some information requires correction before we can approve it.</p>
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; font-size: 14px; border-radius: 0 8px 8px 0;">
      <strong>Reason for Request:</strong><br>
      ${reason}
    </div>
    <p>Please log in, edit the requested fields in your profile, and submit it again for verification.</p>
    <a href="#" class="btn">Edit Profile</a>
  `
);
