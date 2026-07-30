import { ProfileResponse } from "../dto/profile.dto";

export class ProfileSerializer {
  static serialize(profile: ProfileResponse, canViewFullDetails: boolean = false): Partial<ProfileResponse> {
    if (canViewFullDetails) {
      return profile;
    }
    return {
      ...profile,
      income: null,
      city: "Confidential",
      state: profile.state,
      country: profile.country,
      photos: profile.photos.map((p) => {
        if (!p.isMain) {
          return {
            ...p,
            url: "/placeholder-blurred.jpg",
          };
        }
        return p;
      }),
    };
  }

  static serializeMany(profiles: ProfileResponse[], canViewFullDetails: boolean = false): Partial<ProfileResponse>[] {
    return profiles.map((p) => this.serialize(p, canViewFullDetails));
  }
}
