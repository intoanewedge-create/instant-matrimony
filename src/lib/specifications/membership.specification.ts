export class MembershipSpecification {
  static activeOnly() {
    return {
      status: "ACTIVE",
      endDate: { gte: new Date() },
    };
  }
}
