import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function testAuth() {
  console.log("Testing user logins...");
  
  const testAccounts = [
    { email: "admin@instantmatrimony.com", pass: "Admin@123" },
    { email: "user@instantmatrimony.com", pass: "User@123" },
    { email: "premium-gold@instantmatrimony.com", pass: "User@123" },
    { email: "verified@instantmatrimony.com", pass: "User@123" },
    { email: "unverified@instantmatrimony.com", pass: "User@123" },
  ];

  for (const acc of testAccounts) {
    const user = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!user) {
      console.log(`❌ User NOT found: ${acc.email}`);
      continue;
    }

    const match = await bcrypt.compare(acc.pass, user.password || "");
    console.log(`User: ${acc.email} | Match: ${match} | isEmailVerified: ${user.isEmailVerified} | Role: ${user.role}`);
  }

  await prisma.$disconnect();
}

testAuth();
