import { Membership, MembershipPlan } from "@prisma/client";
import { MembershipResponse } from "../dto/membership.dto";

export class MembershipMapper {
  static toResponse(membership: Membership & { plan: MembershipPlan }): MembershipResponse {
    const remainingMs = membership.endDate.getTime() - Date.now();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

    return {
      id: membership.id,
      userId: membership.userId,
      planId: membership.planId,
      planName: membership.plan.name,
      price: membership.plan.price,
      status: membership.status,
      startDate: membership.startDate.toISOString(),
      endDate: membership.endDate.toISOString(),
      remainingDays,
    };
  }
}
