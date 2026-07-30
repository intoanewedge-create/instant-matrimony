export const COMPATIBILITY_WEIGHTS = {
  age: 15,
  height: 10,
  religion: 15,
  caste: 15,
  motherTongue: 15,
  income: 10,
  location: 10,
  lifestyle: 10,
};

export const MEMBERSHIP_LIMITS = {
  FREE_MESSAGES_PER_DAY: 5,
  FREE_FAVORITES_LIMIT: 10,
};

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
};

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const PROFILE_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
} as const;

export const DOMAIN_EVENTS = {
  USER_REGISTERED: "UserRegistered",
  PROFILE_SUBMITTED: "ProfileSubmitted",
  PROFILE_APPROVED: "ProfileApproved",
  PROFILE_REJECTED: "ProfileRejected",
  INTEREST_SENT: "InterestSent",
  INTEREST_ACCEPTED: "InterestAccepted",
  MEMBERSHIP_PURCHASED: "MembershipPurchased",
  MESSAGE_SENT: "MessageSent",
} as const;

export const CACHE_KEYS = {
  USER_PREFIX: "user:",
  PROFILE_PREFIX: "profile:",
  COMPATIBILITY_PREFIX: "compat:",
};
