import { prisma } from "../prisma";
import { container } from "../container";
import assert from "assert";

async function runMessagingAudit() {
  console.log("=================================================");
  console.log("🚀 STARTING REAL DATABASE MESSAGING AUDIT");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const userAEmail = `msg_audit_a_${timestamp}@instantmatrimony.com`;
  const userBEmail = `msg_audit_b_${timestamp}@instantmatrimony.com`;
  const userCEmail = `msg_audit_c_${timestamp}@instantmatrimony.com`;
  const phoneA = `+9198${(timestamp % 100000000).toString().padStart(8, "0")}`;
  const phoneB = `+9197${(timestamp % 100000000).toString().padStart(8, "0")}`;
  const phoneC = `+9196${(timestamp % 100000000).toString().padStart(8, "0")}`;

  let userA: any;
  let userB: any;
  let userC: any;
  let conversationId: string | null = null;
  let createdMessageId: string | null = null;

  try {
    // 1. Check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ PostgreSQL Database connection verified.");

    // 2. Create User A (Male, Approved, Standard Membership Plan)
    const regA = await container.services.authService.register({
      name: "Audit User A",
      email: userAEmail,
      phone: phoneA,
      password: "User@123",
    });
    if (!regA.success) throw new Error(`User A registration failed: ${regA.error}`);
    userA = await prisma.user.findUniqueOrThrow({ where: { email: userAEmail } });

    await prisma.user.update({
      where: { id: userA.id },
      data: { isEmailVerified: true, emailVerified: new Date(), isPhoneVerified: true },
    });
    await prisma.profile.update({
      where: { userId: userA.id },
      data: {
        status: "APPROVED",
        gender: "MALE",
        religion: "Hindu",
        maritalStatus: "SINGLE",
        dateOfBirth: new Date("1995-01-01"),
      },
    });

    // Assign Standard Membership to User A
    const standardPlan = await prisma.membershipPlan.findFirst({
      where: {
        OR: [
          { name: { contains: "Standard", mode: "insensitive" } },
          { name: { contains: "Gold", mode: "insensitive" } },
          { price: { gte: 1000 } },
        ],
      },
    });

    let planId = standardPlan?.id;
    if (!planId) {
      const createdPlan = await prisma.membershipPlan.create({
        data: {
          name: "Standard Plan",
          price: 1000,
          durationDays: 90,
          features: ["DIRECT_MESSAGING", "CONTACT_UNLOCKS"],
        },
      });
      planId = createdPlan.id;
    }

    await prisma.membership.create({
      data: {
        userId: userA.id,
        planId: planId!,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("✓ User A created (Male, Approved, Active Membership).");

    // 3. Create User B (Female, Approved)
    const regB = await container.services.authService.register({
      name: "Audit User B",
      email: userBEmail,
      phone: phoneB,
      password: "User@123",
    });
    if (!regB.success) throw new Error(`User B registration failed: ${regB.error}`);
    userB = await prisma.user.findUniqueOrThrow({ where: { email: userBEmail } });

    await prisma.user.update({
      where: { id: userB.id },
      data: { isEmailVerified: true, emailVerified: new Date(), isPhoneVerified: true },
    });
    await prisma.profile.update({
      where: { userId: userB.id },
      data: {
        status: "APPROVED",
        gender: "FEMALE",
        religion: "Hindu",
        maritalStatus: "SINGLE",
        dateOfBirth: new Date("1997-01-01"),
      },
    });
    console.log("✓ User B created (Female, Approved).");

    // 4. Create User C (Unauthorized / External User)
    const regC = await container.services.authService.register({
      name: "Audit User C",
      email: userCEmail,
      phone: phoneC,
      password: "User@123",
    });
    if (!regC.success) throw new Error(`User C registration failed: ${regC.error}`);
    userC = await prisma.user.findUniqueOrThrow({ where: { email: userCEmail } });

    await prisma.user.update({
      where: { id: userC.id },
      data: { isEmailVerified: true, emailVerified: new Date() },
    });
    await prisma.profile.update({
      where: { userId: userC.id },
      data: {
        status: "APPROVED",
        gender: "FEMALE",
      },
    });
    console.log("✓ User C created (Unauthorized third party).");

    // 5. Send & Accept Interest between User A and User B
    const sendIntRes = await container.services.interestService.sendInterest(userA.id, userB.id);
    assert.ok(sendIntRes.success, `Interest sending failed: ${sendIntRes.error}`);
    const interestId = sendIntRes.data.id;

    const acceptIntRes = await container.services.interestService.acceptInterest(userB.id, interestId);
    assert.ok(acceptIntRes.success, `Interest acceptance failed: ${acceptIntRes.error}`);
    console.log("✓ Interest sent and accepted between User A and User B.");

    // 6. Test Conversation List Fetching
    const convosARes = await container.services.messagingService.getConversations(userA.id);
    assert.ok(convosARes.success, "User A conversation fetch failed");
    assert.ok(Array.isArray(convosARes.data), "Conversations data should be an array");
    const convA = convosARes.data.find((c: any) => c.contactId === userB.id);
    assert.ok(convA, "Conversation with User B should appear in User A conversation list");
    conversationId = convA.id;
    console.log("✓ Real conversation list retrieved for User A with User B.");

    const convosBRes = await container.services.messagingService.getConversations(userB.id);
    assert.ok(convosBRes.success, "User B conversation fetch failed");
    // @ts-ignore
    const convB = convosBRes.data.find((c: any) => c.contactId === userA.id);
    assert.ok(convB, "Conversation with User A should appear in User B conversation list");
    console.log("✓ Real conversation list retrieved for User B with User A.");

    // 7. Send Real Message from User A to User B
    const testMessageContent = "Hello from User A at " + new Date().toISOString();
    const sendMsgRes = await container.services.messagingService.sendMessage(userA.id, userB.id, testMessageContent);
    assert.ok(sendMsgRes.success, `Sending message failed: ${sendMsgRes.error}`);
    // @ts-ignore
    assert.strictEqual(sendMsgRes.data.content, testMessageContent);
    // @ts-ignore
    assert.strictEqual(sendMsgRes.data.senderId, userA.id);
    // @ts-ignore
    assert.strictEqual(sendMsgRes.data.receiverId, userB.id);
    // @ts-ignore
    createdMessageId = sendMsgRes.data.id;
    console.log("✓ Real message sent from User A to User B and persisted to PostgreSQL.");

    // 8. Fetch Real Chat Messages
    const chatMsgsRes = await container.services.messagingService.getChatMessages(userA.id, userB.id);
    assert.ok(chatMsgsRes.success, `Chat messages fetch failed: ${chatMsgsRes.error}`);
    // @ts-ignore
    const foundMsg = chatMsgsRes.data.find((m: any) => m.id === createdMessageId);
    assert.ok(foundMsg, "Sent message must be in fetched chat messages");
    assert.strictEqual(foundMsg.content, testMessageContent);
    console.log("✓ Chat messages history retrieved accurately from database.");

    // 9. Mark As Read & Unread Count Reset
    const markReadRes = await container.services.messagingService.markAsRead(userB.id, userA.id);
    assert.ok(markReadRes.success, `markAsRead failed: ${markReadRes.error}`);
    
    // Verify participant unread count reset
    const partB = await container.repositories.conversationParticipantRepository.findParticipant(conversationId!, userB.id);
    assert.strictEqual(partB?.unreadCount, 0, "Unread count should be reset to 0");
    console.log("✓ markAsRead verified: unread count reset to 0.");

    // 10. Unauthorized Deletion Attempt (User B trying to delete User A's message)
    const badDeleteRes = await container.services.messagingService.deleteMessage(userB.id, createdMessageId!);
    assert.strictEqual(badDeleteRes.success, false, "Non-sender should NOT be allowed to delete message");
    console.log("✓ Unauthorized deletion correctly rejected by server.");

    // 11. Authorized Soft Deletion by Sender (User A)
    const goodDeleteRes = await container.services.messagingService.deleteMessage(userA.id, createdMessageId!);
    assert.ok(goodDeleteRes.success, `Deletion failed: ${goodDeleteRes.error}`);

    // Verify soft deletion in database
    const dbMsg = await prisma.message.findUnique({ where: { id: createdMessageId! } });
    assert.strictEqual(dbMsg?.isDeleted, true, "Message isDeleted must be true");
    assert.ok(dbMsg?.deletedAt, "Message deletedAt must be set");
    console.log("✓ Message soft deletion confirmed in database (isDeleted=true, deletedAt populated).");

    // Verify soft-deleted message is hidden from conversation fetch
    const postDeleteMsgsRes = await container.services.messagingService.getChatMessages(userA.id, userB.id);
    // @ts-ignore
    const postDeleteFound = postDeleteMsgsRes.data.find((m: any) => m.id === createdMessageId);
    assert.ok(!postDeleteFound, "Soft-deleted message must NOT be returned in chat history");
    console.log("✓ Soft-deleted message successfully excluded from chat history.");

    // 12. Security Boundary Check: User C cannot access User A & B's conversation
    const userCAccess = await container.services.messagingService.getChatMessages(userC.id, userA.id);
    assert.strictEqual(userCAccess.success, false, "Unauthorized User C must not access User A chat");
    console.log("✓ Security boundary verified: Unauthorized third party access strictly forbidden.");

    console.log("\n=================================================");
    console.log("🎉 ALL REAL MESSAGING AUDIT CHECKS PASSED!");
    console.log("=================================================\n");
  } finally {
    // Cleanup audit records
    try {
      if (createdMessageId) {
        await prisma.message.deleteMany({ where: { id: createdMessageId } });
      }
      if (conversationId) {
        await prisma.conversationParticipant.deleteMany({ where: { conversationId } });
        await prisma.conversation.deleteMany({ where: { id: conversationId } });
      }
      if (userA?.id) {
        await prisma.interest.deleteMany({ where: { OR: [{ senderId: userA.id }, { receiverId: userA.id }] } });
        await prisma.membership.deleteMany({ where: { userId: userA.id } });
        await prisma.profile.deleteMany({ where: { userId: userA.id } });
        await prisma.user.deleteMany({ where: { id: userA.id } });
      }
      if (userB?.id) {
        await prisma.interest.deleteMany({ where: { OR: [{ senderId: userB.id }, { receiverId: userB.id }] } });
        await prisma.profile.deleteMany({ where: { userId: userB.id } });
        await prisma.user.deleteMany({ where: { id: userB.id } });
      }
      if (userC?.id) {
        await prisma.profile.deleteMany({ where: { userId: userC.id } });
        await prisma.user.deleteMany({ where: { id: userC.id } });
      }
      console.log("🧹 Audit cleanup completed.");
    } catch {
      // Ignore cleanup errors
    }
  }
}

runMessagingAudit().catch((err) => {
  console.error("❌ Messaging Audit Failed:", err);
  process.exit(1);
});
