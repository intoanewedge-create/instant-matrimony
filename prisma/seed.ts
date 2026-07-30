import { PrismaClient, Role, AccountStatus, VerificationStatus, ProfileStatus, MembershipStatus, OrderStatus, PaymentStatus, NotificationType, ReportStatus, InterestStatus, PaymentGateway, TransactionType } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Clean existing database records
  console.log("Cleaning database...");
  await prisma.siteSettings.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.interest.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.membershipPlan.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.partnerPreference.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Site Settings
  console.log("Seeding Site Settings...");
  const settingsData = [
    { key: "site_name", value: "InstantMatrimony", description: "Name of the matrimonial portal" },
    { key: "support_email", value: "support@instantmatrimony.com", description: "Official support email address" },
    { key: "support_phone", value: "+91 98765 43210", description: "Official support helpline number" },
    { key: "primary_color", value: "#1e40af", description: "Brand primary color (Royal Blue)" },
    { key: "accent_color", value: "#d97706", description: "Brand accent color (Gold)" },
    { key: "seo_title", value: "InstantMatrimony - Find Your Perfect Life Partner", description: "Default homepage SEO title" },
    { key: "seo_description", value: "InstantMatrimony is a premium matrimonial platform with verified profiles and secure chat.", description: "Default SEO description" },
    { key: "logo_url", value: "/images/logo.png", description: "Site brand logo" },
    { key: "smtp_host", value: "smtp.mailtrap.io", description: "Mail server host placeholder" },
    { key: "sms_gateway", value: "https://api.textlocal.in", description: "SMS gateway provider URL" }
  ];
  for (const item of settingsData) {
    await prisma.siteSettings.create({ data: item });
  }

  // 3. Seed Membership Plans
  console.log("Seeding Membership Plans...");
  const plans = [
    {
      name: "Silver",
      description: "Basic plan for profile views and initial connections",
      price: 1499,
      durationDays: 30,
      features: ["View 15 Contact Numbers", "Send Unlimited Interests", "Direct Chat (Up to 5 profiles)"],
      isActive: true
    },
    {
      name: "Gold",
      description: "Most popular plan with extended duration and contacts",
      price: 2999,
      durationDays: 90,
      features: ["View 40 Contact Numbers", "Send Unlimited Interests", "Direct Chat (Up to 15 profiles)", "Profile Highlight for 7 Days"],
      isActive: true
    },
    {
      name: "Platinum",
      description: "Premium plan for serious seekers seeking max visibility",
      price: 4999,
      durationDays: 180,
      features: ["View 100 Contact Numbers", "Send Unlimited Interests", "Unlimited Direct Chat", "Profile Highlight for 30 Days", "Dedicated Relationship Advisor"],
      isActive: true
    },
    {
      name: "Diamond",
      description: "Ultimate elite plan with advisor-led match finding",
      price: 8999,
      durationDays: 365,
      features: ["View 250 Contact Numbers", "Send Unlimited Interests", "Unlimited Direct Chat", "Profile Highlight for 90 Days", "Personal Relationship Manager", "Priority search listing"],
      isActive: true
    }
  ];

  const seededPlans: any[] = [];
  for (const p of plans) {
    const plan = await prisma.membershipPlan.create({ data: p });
    seededPlans.push(plan);
  }

  // 4. Seed Admin Account
  console.log("Seeding Admin Account...");
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Administrator",
      email: "admin@instantmatrimony.com",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+91 99999 88888",
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });

  // Create empty profile for admin
  await prisma.profile.create({
    data: {
      userId: adminUser.id,
      bio: "Site administrator profile",
      status: ProfileStatus.APPROVED
    }
  });

  // 4b. Seed Accounts Based on Account State & Verification State
  console.log("Seeding Test Accounts for Account & Verification States...");
  const stdUserPassword = await bcrypt.hash("User@123", 10);

  // Registered User (user@instantmatrimony.com)
  const normalUser = await prisma.user.create({
    data: {
      name: "Registered User",
      email: "user@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00001",
      role: Role.USER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.PENDING,
      isActive: true,
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });
  await prisma.profile.create({
    data: {
      userId: normalUser.id,
      gender: "MALE",
      dateOfBirth: new Date(1995, 5, 15),
      religion: "Hindu",
      motherTongue: "Hindi",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      bio: "Standard registered user profile.",
      status: ProfileStatus.APPROVED,
      completionPercent: 85,
    }
  });

  // Premium Gold Test Account (premium-gold@instantmatrimony.com)
  const premiumGoldUser = await prisma.user.create({
    data: {
      name: "Premium Gold User",
      email: "premium-gold@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00002",
      role: Role.USER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      isActive: true,
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });
  await prisma.profile.create({
    data: {
      userId: premiumGoldUser.id,
      gender: "FEMALE",
      dateOfBirth: new Date(1996, 6, 18),
      religion: "Hindu",
      motherTongue: "Hindi",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      bio: "Premium Gold subscriber profile with full access.",
      status: ProfileStatus.APPROVED,
      completionPercent: 90,
    }
  });

  const goldPlan = seededPlans[1] || seededPlans[0];
  const goldEndDate = new Date();
  goldEndDate.setDate(goldEndDate.getDate() + 90);
  await prisma.membership.create({
    data: {
      userId: premiumGoldUser.id,
      planId: goldPlan.id,
      status: MembershipStatus.ACTIVE,
      startDate: new Date(),
      endDate: goldEndDate
    }
  });

  // Verified Account State User (verified@instantmatrimony.com)
  const verifiedUser = await prisma.user.create({
    data: {
      name: "Verified Identity User",
      email: "verified@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00003",
      role: Role.USER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      isActive: true,
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });
  await prisma.profile.create({
    data: {
      userId: verifiedUser.id,
      gender: "MALE",
      dateOfBirth: new Date(1993, 2, 10),
      religion: "Sikh",
      motherTongue: "Punjabi",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      bio: "Verified profile with government identity approval.",
      status: ProfileStatus.APPROVED,
      completionPercent: 100,
    }
  });

  // Unverified Account State User (unverified@instantmatrimony.com)
  const unverifiedUser = await prisma.user.create({
    data: {
      name: "Unverified Email User",
      email: "unverified@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00004",
      role: Role.USER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.PENDING,
      isActive: true,
      emailVerified: null,
      isEmailVerified: false,
      isPhoneVerified: false,
    }
  });
  await prisma.profile.create({
    data: {
      userId: unverifiedUser.id,
      gender: "FEMALE",
      dateOfBirth: new Date(1998, 11, 5),
      bio: "Unverified profile waiting for email verification.",
      status: ProfileStatus.DRAFT,
      completionPercent: 30,
    }
  });

  // Suspended Account State User (suspended@instantmatrimony.com)
  const suspendedUser = await prisma.user.create({
    data: {
      name: "Suspended Test User",
      email: "suspended@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00005",
      role: Role.USER,
      accountStatus: AccountStatus.SUSPENDED,
      verificationStatus: VerificationStatus.PENDING,
      isActive: false,
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });
  await prisma.profile.create({
    data: {
      userId: suspendedUser.id,
      gender: "MALE",
      dateOfBirth: new Date(1992, 1, 1),
      bio: "Suspended profile.",
      status: ProfileStatus.SUSPENDED,
      completionPercent: 50,
    }
  });

  // Blocked Account State User (blocked@instantmatrimony.com)
  const blockedUser = await prisma.user.create({
    data: {
      name: "Blocked Test User",
      email: "blocked@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00006",
      role: Role.USER,
      accountStatus: AccountStatus.BLOCKED,
      verificationStatus: VerificationStatus.PENDING,
      isActive: true,
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });
  await prisma.profile.create({
    data: {
      userId: blockedUser.id,
      gender: "FEMALE",
      dateOfBirth: new Date(1997, 4, 12),
      bio: "Blocked profile for relation testing.",
      status: ProfileStatus.APPROVED,
      completionPercent: 80,
    }
  });

  // Block relationship between normalUser and blockedUser
  await prisma.block.create({
    data: {
      blockerId: normalUser.id,
      blockedId: blockedUser.id
    }
  });

  // Expired Subscription Test Account (test-expired@instantmatrimony.com)
  const expiredUser = await prisma.user.create({
    data: {
      name: "Expired Subscription User",
      email: "test-expired@instantmatrimony.com",
      password: stdUserPassword,
      phone: "+91 98765 00007",
      role: Role.USER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.PENDING,
      isActive: true,
      emailVerified: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
    }
  });
  await prisma.profile.create({
    data: {
      userId: expiredUser.id,
      gender: "MALE",
      dateOfBirth: new Date(1994, 3, 20),
      bio: "User with expired gold membership.",
      status: ProfileStatus.APPROVED,
      completionPercent: 80,
    }
  });

  const expiredStartDate = new Date();
  expiredStartDate.setDate(expiredStartDate.getDate() - 31);
  const expiredEndDate = new Date();
  expiredEndDate.setDate(expiredEndDate.getDate() - 1); // Expired yesterday

  await prisma.membership.create({
    data: {
      userId: expiredUser.id,
      planId: goldPlan.id,
      status: MembershipStatus.EXPIRED,
      startDate: expiredStartDate,
      endDate: expiredEndDate
    }
  });

  // 5. Seed realistic Indian Demo Users
  console.log("Seeding Demo Users...");
  const firstNamesMale = ["Aarav", "Kabir", "Rohan", "Aditya", "Vikram", "Rahul", "Arjun", "Dev", "Siddharth", "Karan", "Neil", "Anirudh", "Amit", "Manish", "Gaurav", "Varun", "Vivek", "Sanjay"];
  const firstNamesFemale = ["Priya", "Ananya", "Sneha", "Diya", "Riya", "Kavya", "Ishita", "Meera", "Asha", "Shreya", "Neha", "Divya", "Pooja", "Aishwarya", "Shruti", "Tanvi", "Swati", "Nisha"];
  const lastNames = ["Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Reddy", "Choudhury", "Joshi", "Kulkarni", "Sen", "Gupta", "Rao", "Kapoor", "Singh", "Das", "Bose", "Menon"];
  
  const cities = ["Mumbai", "Bangalore", "Chennai", "Delhi", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"];
  const statesMap: Record<string, string> = {
    "Mumbai": "Maharashtra",
    "Bangalore": "Karnataka",
    "Chennai": "Tamil Nadu",
    "Delhi": "Delhi",
    "Kolkata": "West Bengal",
    "Hyderabad": "Telangana",
    "Pune": "Maharashtra",
    "Ahmedabad": "Gujarat"
  };

  const religions = ["Hindu", "Muslim", "Sikh", "Christian", "Jain"];
  const languages = ["Hindi", "Tamil", "Telugu", "Bengali", "Kannada", "Marathi", "Gujarati", "Malayalam"];
  const educations = ["B.Tech", "M.Tech", "MBA", "MBBS", "MD", "B.Com", "MCA", "B.Arch", "Ph.D."];
  const occupations = ["Software Engineer", "Doctor", "Product Manager", "Business Analyst", "Architect", "Chartered Accountant", "Consultant", "Research Scientist", "Entrepreneur"];
  
  const userPassword = await bcrypt.hash("User@123", 10);
  const demoUsers: any[] = [];

  // Generate 40 demo users
  for (let i = 0; i < 40; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale 
      ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
      : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@demo.com`;
    const phone = `+91 ${9000000000 + i}`;
    
    // Status distribution
    let status: ProfileStatus = ProfileStatus.APPROVED;
    if (i % 8 === 0) status = ProfileStatus.PENDING;
    else if (i % 12 === 0) status = ProfileStatus.REJECTED;
    else if (i % 15 === 0) status = ProfileStatus.SUSPENDED;
    else if (i % 20 === 0) status = ProfileStatus.DRAFT;

    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = statesMap[city];
    
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: userPassword,
        phone,
        role: Role.USER,
        isActive: status !== ProfileStatus.SUSPENDED,
        emailVerified: status !== ProfileStatus.DRAFT ? new Date() : null,
        isEmailVerified: status !== ProfileStatus.DRAFT,
        isPhoneVerified: status !== ProfileStatus.DRAFT,
      }
    });

    const birthYear = 1990 + Math.floor(Math.random() * 10); // ages 26 to 36
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = 1 + Math.floor(Math.random() * 28);
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        gender: isMale ? "MALE" : "FEMALE",
        dateOfBirth,
        religion: religions[Math.floor(Math.random() * religions.length)],
        motherTongue: languages[Math.floor(Math.random() * languages.length)],
        caste: "General",
        height: 155 + Math.floor(Math.random() * 30), // 155 to 185 cm
        maritalStatus: "NEVER_MARRIED",
        education: educations[Math.floor(Math.random() * educations.length)],
        occupation: occupations[Math.floor(Math.random() * occupations.length)],
        income: 600000 + Math.floor(Math.random() * 2400000), // 6L to 30L
        city,
        state,
        country: "India",
        bio: `Hi, I am a simple, down-to-earth person working as a ${occupations[Math.floor(Math.random() * occupations.length)].toLowerCase()}. I value family bonds and respect cultural morals. Looking for a partner who is compatibility-driven and supportive.`,
        completionPercent: 75 + Math.floor(Math.random() * 25),
        status,
        approvedById: status === ProfileStatus.APPROVED ? adminUser.id : null,
        approvedAt: status === ProfileStatus.APPROVED ? new Date() : null
      }
    });

    // Create Photo (Provider-independent url placeholder)
    const genderTag = isMale ? "men" : "women";
    const photoNum = (i % 20) + 1;
    await prisma.photo.create({
      data: {
        profileId: profile.id,
        url: `/placeholders/${genderTag}/${photoNum}.jpg`,
        isMain: true,
        isApproved: status === ProfileStatus.APPROVED
      }
    });

    // Partner Preference
    await prisma.partnerPreference.create({
      data: {
        profileId: profile.id,
        minAge: isMale ? 22 : 25,
        maxAge: isMale ? 30 : 35,
        minHeight: isMale ? 150 : 165,
        maxHeight: isMale ? 175 : 190,
        maritalStatus: "NEVER_MARRIED",
        religion: profile.religion,
        motherTongue: profile.motherTongue,
        country: "India"
      }
    });

    demoUsers.push({ user, profile });
  }
  console.log(`Seeded ${demoUsers.length} demo profiles.`);

  // 6. Seed Memberships for some users
  console.log("Seeding Memberships & Orders...");
  const approvedUsers = demoUsers.filter(du => du.profile.status === ProfileStatus.APPROVED);
  
  for (let idx = 0; idx < approvedUsers.length; idx++) {
    const { user } = approvedUsers[idx];
    
    // Assign memberships to approx 40% of users
    if (idx % 3 === 0) {
      const plan = seededPlans[idx % seededPlans.length];
      let status: MembershipStatus = MembershipStatus.ACTIVE;
      let startOffsetDays = 5;
      let endOffsetDays = plan.durationDays;
      
      if (idx % 9 === 0) {
        status = MembershipStatus.EXPIRED;
        startOffsetDays = plan.durationDays + 10;
        endOffsetDays = -10;
      } else if (idx % 12 === 0) {
        status = MembershipStatus.CANCELLED;
        startOffsetDays = 15;
        endOffsetDays = plan.durationDays - 15;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - startOffsetDays);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + endOffsetDays);

      await prisma.membership.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status,
          startDate,
          endDate
        }
      });

      // Seeding corresponding Order & Transaction
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount: plan.price,
          status: status === MembershipStatus.ACTIVE ? OrderStatus.COMPLETED : OrderStatus.CANCELLED,
          gatewayOrderId: `ord_${Math.random().toString(36).substring(2, 9)}`,
          gatewayPaymentId: status === MembershipStatus.ACTIVE ? `pay_${Math.random().toString(36).substring(2, 9)}` : null
        }
      });

      if (status === MembershipStatus.ACTIVE) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: plan.price,
            status: PaymentStatus.PAID,
            gateway: PaymentGateway.STRIPE,
            gatewayTransactionId: `txn_${Math.random().toString(36).substring(2, 9)}`
          }
        });

        await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: plan.price,
            type: TransactionType.DEBIT,
            description: `Purchased Membership Plan: ${plan.name}`
          }
        });
      }
    }
  }

  // 7. Seed Interests (Requests)
  console.log("Seeding Interest requests...");
  const approvedMaleUsers = approvedUsers.filter(u => u.profile.gender === "MALE");
  const approvedFemaleUsers = approvedUsers.filter(u => u.profile.gender === "FEMALE");

  for (let j = 0; j < Math.min(12, approvedMaleUsers.length, approvedFemaleUsers.length); j++) {
    const sender = approvedMaleUsers[j].user;
    const receiver = approvedFemaleUsers[j].user;
    
    let interestStatus: InterestStatus = InterestStatus.PENDING;
    if (j % 3 === 0) interestStatus = InterestStatus.ACCEPTED;
    else if (j % 5 === 0) interestStatus = InterestStatus.DECLINED;
    else if (j % 7 === 0) interestStatus = InterestStatus.WITHDRAWN;

    await prisma.interest.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        status: interestStatus
      }
    });

    // Create corresponding notification
    if (interestStatus === InterestStatus.PENDING) {
      await prisma.notification.create({
        data: {
          userId: receiver.id,
          title: "New Interest Received",
          message: `${sender.name} has sent you a connection interest request.`,
          type: NotificationType.INFO
        }
      });
    } else if (interestStatus === InterestStatus.ACCEPTED) {
      await prisma.notification.create({
        data: {
          userId: sender.id,
          title: "Interest Request Accepted",
          message: `${receiver.name} has accepted your interest. You can now chat directly!`,
          type: NotificationType.SUCCESS
        }
      });
    }
  }

  // 8. Seed Chats / Messages
  console.log("Seeding conversations...");
  // Let's seed messages between male[0] and female[0] (accepted interest above)
  if (approvedMaleUsers.length > 0 && approvedFemaleUsers.length > 0) {
    const u1 = approvedMaleUsers[0].user;
    const u2 = approvedFemaleUsers[0].user;

    const conv = [
      { senderId: u1.id, receiverId: u2.id, content: "Hello Priya, I saw your profile and felt we share similar family values. Would love to connect!" },
      { senderId: u2.id, receiverId: u1.id, content: "Hi Aarav, thanks for reaching out. Yes, I read your bio. Where are you currently based in Mumbai?" },
      { senderId: u1.id, receiverId: u2.id, content: "I am in Andheri East, working in a fintech company. How about you?" },
      { senderId: u2.id, receiverId: u1.id, content: "Nice! I live in Bandra and work as a UX Designer. Let's catch up sometime next week?" }
    ];

    for (const msg of conv) {
      await prisma.message.create({
        data: {
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          read: true
        }
      });
    }

    // Unread message
    await prisma.message.create({
      data: {
        senderId: u1.id,
        receiverId: u2.id,
        content: "Sure, let's connect on Saturday afternoon. Does Starbucks Bandra work?",
        read: false
      }
    });
  }

  // 9. Seed Favorites & Blocks & Reports
  console.log("Seeding relations (Favorites, Blocks, Reports)...");
  if (approvedMaleUsers.length > 2 && approvedFemaleUsers.length > 2) {
    // Favorite
    await prisma.favorite.create({
      data: {
        userId: approvedMaleUsers[1].user.id,
        favoriteUserId: approvedFemaleUsers[1].user.id
      }
    });

    // Block
    await prisma.block.create({
      data: {
        blockerId: approvedMaleUsers[2].user.id,
        blockedId: approvedFemaleUsers[2].user.id
      }
    });

    // Report
    await prisma.report.create({
      data: {
        reporterId: approvedFemaleUsers[0].user.id,
        reportedUserId: approvedMaleUsers[1].user.id,
        reason: "Matches with wrong occupation info. Not working at stated company.",
        status: ReportStatus.PENDING
      }
    });
  }

  // 10. Seed Audit Logs
  console.log("Seeding Audit Logs...");
  const logs = [
    { action: "Admin Approved Profile", details: "Admin approved profile of Aarav Patel", userId: adminUser.id },
    { action: "User Logged In", details: "User Aarav Patel logged in from IP 192.168.1.5", userId: approvedUsers[0]?.user.id },
    { action: "Membership Activated", details: "Gold plan activated for Kabir Verma", userId: approvedUsers[1]?.user.id },
    { action: "Settings Updated", details: "SMTP server configurations revised", userId: adminUser.id }
  ];
  for (const log of logs) {
    await prisma.auditLog.create({
      data: {
        action: log.action,
        details: log.details,
        userId: log.userId,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
