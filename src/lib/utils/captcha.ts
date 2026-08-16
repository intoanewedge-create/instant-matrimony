import crypto from "crypto";

const CAPTCHA_SECRET = process.env.NEXTAUTH_SECRET || "instantmatrimony-captcha-secret-key-2026";
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateCaptchaChallenge(): { token: string; svgDataUri: string } {
  // Generate 6-char random text
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
  const codeHash = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(`${code.toUpperCase()}:${expiresAt}`)
    .digest("hex");

  const token = `${expiresAt}.${codeHash}`;

  // Generate lightweight SVG challenge image with noise & distortion
  const noiseLines = Array.from({ length: 4 })
    .map(() => {
      const x1 = Math.floor(Math.random() * 140);
      const y1 = Math.floor(Math.random() * 45);
      const x2 = Math.floor(Math.random() * 140);
      const y2 = Math.floor(Math.random() * 45);
      const color = ["#e11d48", "#2563eb", "#059669", "#7c3aed"][Math.floor(Math.random() * 4)];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" opacity="0.4" />`;
    })
    .join("");

  const charSvg = code
    .split("")
    .map((char, index) => {
      const x = 18 + index * 20;
      const y = 30 + (Math.random() * 6 - 3);
      const rot = Math.floor(Math.random() * 24 - 12);
      const colors = ["#e11d48", "#1e293b", "#2563eb", "#047857", "#b91c1c"];
      const color = colors[index % colors.length];
      return `<text x="${x}" y="${y}" transform="rotate(${rot}, ${x}, ${y})" font-family="monospace, monospace" font-weight="800" font-size="22" fill="${color}" letter-spacing="2">${char}</text>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="45" viewBox="0 0 150 45" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
    <rect width="100%" height="100%" fill="#f8fafc"/>
    ${noiseLines}
    ${charSvg}
  </svg>`;

  const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return { token, svgDataUri };
}

export function verifyCaptchaCode(inputCode: string, token: string): { valid: boolean; reason?: string } {
  if (!inputCode || !inputCode.trim()) {
    return { valid: false, reason: "CAPTCHA is required." };
  }

  if (!token || !token.includes(".")) {
    return { valid: false, reason: "Invalid CAPTCHA token." };
  }

  const [expiresAtStr, expectedHash] = token.split(".");
  const expiresAt = Number(expiresAtStr);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, reason: "CAPTCHA expired. Please refresh." };
  }

  const computedHash = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(`${inputCode.trim().toUpperCase()}:${expiresAtStr}`)
    .digest("hex");

  if (computedHash !== expectedHash) {
    return { valid: false, reason: "Invalid CAPTCHA. Please try again." };
  }

  return { valid: true };
}
