export class UserSpecification {
  static activeOnly() {
    return {
      isActive: true,
      deletedAt: null,
    };
  }
}
