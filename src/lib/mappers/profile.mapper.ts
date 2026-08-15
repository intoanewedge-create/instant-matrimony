import { Profile, Photo, PartnerPreference } from "@prisma/client";
import { ProfileResponse, PhotoDto, PartnerPreferenceDto } from "../dto/profile.dto";
import { calculateAge } from "../utils/date";

export class ProfileMapper {
  static toResponse(
    profile: Profile & { photos?: Photo[]; partnerPreference?: PartnerPreference | null; user?: { name: string | null } }
  ): ProfileResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      publicId: (profile as any).user?.publicId || null,
      gender: profile.gender,
      age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null,
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
      religion: profile.religion,
      motherTongue: profile.motherTongue,
      caste: profile.caste,
      height: profile.height,
      maritalStatus: profile.maritalStatus,
      education: profile.education,
      occupation: profile.occupation,
      income: profile.income,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      bio: profile.bio,
      completionPercent: profile.completionPercent,
      status: profile.status,
      photos: profile.photos?.map(ProfileMapper.toPhotoDto) || [],
      partnerPreference: profile.partnerPreference ? ProfileMapper.toPartnerPreferenceDto(profile.partnerPreference) : null,
      name: profile.user?.name || null,
    };
  }

  static toPhotoDto(photo: Photo): PhotoDto {
    return {
      id: photo.id,
      url: photo.url,
      isMain: photo.isMain,
      isApproved: photo.isApproved,
    };
  }

  static toPartnerPreferenceDto(preference: PartnerPreference): PartnerPreferenceDto {
    return {
      minAge: preference.minAge,
      maxAge: preference.maxAge,
      minHeight: preference.minHeight,
      maxHeight: preference.maxHeight,
      maritalStatus: preference.maritalStatus,
      religion: preference.religion,
      motherTongue: preference.motherTongue,
      education: preference.education,
      country: preference.country,
    };
  }
}
