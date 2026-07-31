/**
 * Static sample profile data used ONLY for the public (unauthenticated) pages:
 * Browse Profiles, Basic Search and Public Profile Preview.
 *
 * This is presentation-only mock data. It does NOT touch the database, Prisma,
 * authenticated search actions or any business logic. Real profile data remains
 * gated behind authentication exactly as before.
 */

export interface PublicProfile {
  id: string;
  name: string;
  initials: string;
  tone: string; // tailwind gradient classes for the avatar
  age: number;
  gender: "Male" | "Female";
  heightCm: number;
  height: string;
  religion: string;
  community: string;
  motherTongue: string;
  maritalStatus: string;
  city: string;
  state: string;
  education: string;
  profession: string;
  about: string;
  verified: boolean;
  premium: boolean;
  lastActive: string;
}

export const PUBLIC_PROFILES: PublicProfile[] = [
  {
    id: "im-1001",
    name: "Ananya S.",
    initials: "AS",
    tone: "from-rose-400 to-pink-600",
    age: 27,
    gender: "Female",
    heightCm: 163,
    height: "5' 4\"",
    religion: "Hindu",
    community: "Brahmin",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    city: "Chennai",
    state: "Tamil Nadu",
    education: "M.Tech, Computer Science",
    profession: "Software Engineer",
    about:
      "Family-oriented and career-driven, I enjoy classical music, travel and long conversations over filter coffee. Looking for a kind, ambitious partner who values family.",
    verified: true,
    premium: false,
    lastActive: "Active today",
  },
  {
    id: "im-1002",
    name: "Rahul M.",
    initials: "RM",
    tone: "from-sky-400 to-indigo-600",
    age: 30,
    gender: "Male",
    heightCm: 178,
    height: "5' 10\"",
    religion: "Hindu",
    community: "Maratha",
    motherTongue: "Marathi",
    maritalStatus: "Never Married",
    city: "Pune",
    state: "Maharashtra",
    education: "MBA, Finance",
    profession: "Investment Analyst",
    about:
      "Fitness enthusiast and weekend trekker. I believe in mutual respect, honest communication and building a happy home together.",
    verified: true,
    premium: true,
    lastActive: "Active 2 hours ago",
  },
  {
    id: "im-1003",
    name: "Fatima K.",
    initials: "FK",
    tone: "from-emerald-400 to-teal-600",
    age: 26,
    gender: "Female",
    heightCm: 160,
    height: "5' 3\"",
    religion: "Muslim",
    community: "Sunni",
    motherTongue: "Urdu",
    maritalStatus: "Never Married",
    city: "Hyderabad",
    state: "Telangana",
    education: "MBBS",
    profession: "Doctor",
    about:
      "Compassionate doctor who loves reading and calligraphy. Seeking a well-mannered, family-oriented life partner.",
    verified: true,
    premium: false,
    lastActive: "Active yesterday",
  },
  {
    id: "im-1004",
    name: "Gurpreet S.",
    initials: "GS",
    tone: "from-amber-400 to-orange-600",
    age: 31,
    gender: "Male",
    heightCm: 183,
    height: "6' 0\"",
    religion: "Sikh",
    community: "Jat",
    motherTongue: "Punjabi",
    maritalStatus: "Never Married",
    city: "Amritsar",
    state: "Punjab",
    education: "B.Tech, Mechanical",
    profession: "Business Owner",
    about:
      "Down-to-earth and hard-working. Passionate about farming innovation and cricket. Looking for an understanding partner.",
    verified: false,
    premium: false,
    lastActive: "Active 3 days ago",
  },
  {
    id: "im-1005",
    name: "Meera R.",
    initials: "MR",
    tone: "from-fuchsia-400 to-purple-600",
    age: 28,
    gender: "Female",
    heightCm: 165,
    height: "5' 5\"",
    religion: "Hindu",
    community: "Nair",
    motherTongue: "Malayalam",
    maritalStatus: "Never Married",
    city: "Kochi",
    state: "Kerala",
    education: "M.A. Literature",
    profession: "College Lecturer",
    about:
      "Bookworm and amateur poet. I value depth, kindness and a good sense of humour in a companion.",
    verified: true,
    premium: true,
    lastActive: "Active today",
  },
  {
    id: "im-1006",
    name: "Joseph D.",
    initials: "JD",
    tone: "from-cyan-400 to-blue-600",
    age: 29,
    gender: "Male",
    heightCm: 175,
    height: "5' 9\"",
    religion: "Christian",
    community: "Roman Catholic",
    motherTongue: "Konkani",
    maritalStatus: "Never Married",
    city: "Mangalore",
    state: "Karnataka",
    education: "B.Com, CA",
    profession: "Chartered Accountant",
    about:
      "Faith-driven, calm and dependable. Enjoy live music and beach walks. Seeking a supportive and loving partner.",
    verified: true,
    premium: false,
    lastActive: "Active 5 hours ago",
  },
  {
    id: "im-1007",
    name: "Priya N.",
    initials: "PN",
    tone: "from-pink-400 to-rose-600",
    age: 25,
    gender: "Female",
    heightCm: 158,
    height: "5' 2\"",
    religion: "Hindu",
    community: "Reddy",
    motherTongue: "Telugu",
    maritalStatus: "Never Married",
    city: "Bengaluru",
    state: "Karnataka",
    education: "B.Des, Fashion",
    profession: "Product Designer",
    about:
      "Creative soul who loves art, food and spontaneous road trips. Looking for a partner who is progressive yet grounded.",
    verified: true,
    premium: false,
    lastActive: "Active today",
  },
  {
    id: "im-1008",
    name: "Arjun V.",
    initials: "AV",
    tone: "from-indigo-400 to-violet-600",
    age: 33,
    gender: "Male",
    heightCm: 180,
    height: "5' 11\"",
    religion: "Hindu",
    community: "Iyer",
    motherTongue: "Tamil",
    maritalStatus: "Divorced",
    city: "Mumbai",
    state: "Maharashtra",
    education: "MS, Data Science",
    profession: "Data Scientist",
    about:
      "Analytical mind with a warm heart. Enjoy chess, hiking and cooking. Hoping to find a genuine, positive companion.",
    verified: true,
    premium: true,
    lastActive: "Active 1 hour ago",
  },
  {
    id: "im-1009",
    name: "Sana P.",
    initials: "SP",
    tone: "from-teal-400 to-emerald-600",
    age: 29,
    gender: "Female",
    heightCm: 167,
    height: "5' 6\"",
    religion: "Muslim",
    community: "Shia",
    motherTongue: "Hindi",
    maritalStatus: "Never Married",
    city: "Lucknow",
    state: "Uttar Pradesh",
    education: "M.Sc, Biotechnology",
    profession: "Research Associate",
    about:
      "Curious and independent. Love gardening and documentaries. Seeking a respectful, forward-thinking partner.",
    verified: false,
    premium: false,
    lastActive: "Active 2 days ago",
  },
  {
    id: "im-1010",
    name: "Karan B.",
    initials: "KB",
    tone: "from-orange-400 to-red-600",
    age: 28,
    gender: "Male",
    heightCm: 176,
    height: "5' 9\"",
    religion: "Hindu",
    community: "Agarwal",
    motherTongue: "Hindi",
    maritalStatus: "Never Married",
    city: "Delhi",
    state: "Delhi",
    education: "B.Tech, IT",
    profession: "Product Manager",
    about:
      "Optimistic and driven. Foodie who loves startups and stand-up comedy. Looking for a partner to share laughs and dreams.",
    verified: true,
    premium: false,
    lastActive: "Active today",
  },
  {
    id: "im-1011",
    name: "Divya J.",
    initials: "DJ",
    tone: "from-violet-400 to-fuchsia-600",
    age: 27,
    gender: "Female",
    heightCm: 162,
    height: "5' 4\"",
    religion: "Jain",
    community: "Digambar",
    motherTongue: "Gujarati",
    maritalStatus: "Never Married",
    city: "Ahmedabad",
    state: "Gujarat",
    education: "CA, Finance",
    profession: "Finance Manager",
    about:
      "Disciplined yet fun-loving. Enjoy yoga, classical dance and travel. Seeking an honest and family-oriented partner.",
    verified: true,
    premium: true,
    lastActive: "Active 4 hours ago",
  },
  {
    id: "im-1012",
    name: "Vikram T.",
    initials: "VT",
    tone: "from-blue-400 to-cyan-600",
    age: 32,
    gender: "Male",
    heightCm: 182,
    height: "5' 11\"",
    religion: "Hindu",
    community: "Rajput",
    motherTongue: "Hindi",
    maritalStatus: "Never Married",
    city: "Jaipur",
    state: "Rajasthan",
    education: "B.Arch",
    profession: "Architect",
    about:
      "Design-minded and adventurous. Love photography, heritage travel and good conversations. Looking for a like-minded soul.",
    verified: true,
    premium: false,
    lastActive: "Active today",
  },
];

export function getPublicProfileById(id: string): PublicProfile | undefined {
  return PUBLIC_PROFILES.find((p) => p.id === id);
}

export const RELIGION_OPTIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Parsi",
];

export const MOTHER_TONGUE_OPTIONS = [
  "Tamil",
  "Telugu",
  "Hindi",
  "Marathi",
  "Malayalam",
  "Punjabi",
  "Urdu",
  "Konkani",
  "Gujarati",
];
