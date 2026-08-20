export interface ProfileResponse {
  id: string;
  userId: string;
  publicId?: string | null;
  gender: string | null;
  age: number | null;
  dateOfBirth: string | null;
  religion: string | null;
  motherTongue: string | null;
  caste: string | null;
  height: number | null;
  maritalStatus: string | null;
  education: string | null;
  occupation: string | null;
  income: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bio: string | null;
  completionPercent: number;
  status: string;
  photos: PhotoDto[];
  partnerPreference: PartnerPreferenceDto | null;
  name: string | null;
}

export interface PhotoDto {
  id: string;
  url: string;
  isMain: boolean;
  isApproved: boolean;
}

export interface PartnerPreferenceDto {
  minAge: number | null;
  maxAge: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  maritalStatus: string | null;
  religion: string | null;
  caste?: string | null;
  motherTongue: string | null;
  education: string | null;
  occupation?: string | null;
  country: string | null;
  state?: string | null;
  city?: string | null;
}
