import { MembershipResponse } from "../dto/membership.dto";

export class MembershipSerializer {
  static serialize(membership: MembershipResponse): MembershipResponse {
    return membership;
  }
}
