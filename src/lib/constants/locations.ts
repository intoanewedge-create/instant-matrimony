export interface LocationHierarchy {
  state: string;
  districts: {
    name: string;
    cities: string[];
  }[];
}

export const INDIAN_LOCATION_DATA: LocationHierarchy[] = [
  {
    state: "Andhra Pradesh",
    districts: [
      {
        name: "Anantapur",
        cities: ["Anantapur", "Dharmavaram", "Guntakal", "Hindupur", "Kadiri", "Tadipatri", "Uravakonda", "Rayadurg"],
      },
      {
        name: "Chittoor",
        cities: ["Chittoor", "Tirupati", "Madanapalle", "Srikalahasti", "Punganur", "Nagari", "Palamaner", "Puttur"],
      },
      {
        name: "East Godavari",
        cities: ["Kakinada", "Rajahmundry", "Amalapuram", "Samalkot", "Peddapuram", "Mandapeta", "Pithapuram", "Tuni", "Ramachandrapuram"],
      },
      {
        name: "Guntur",
        cities: ["Guntur", "Tenali", "Narasaraopet", "Bapatla", "Mangalagiri", "Sattenapalle", "Chilakaluripet", "Repalle", "Ponnur", "Macherla"],
      },
      {
        name: "Kadapa (YSR District)",
        cities: ["Kadapa", "Proddatur", "Pulivendula", "Jammalamadugu", "Rayachoti", "Rajampet", "Badvel", "Mydukur"],
      },
      {
        name: "Krishna",
        cities: ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid", "Jaggayyapeta", "Pedana", "Vuyyuru", "Kondapalli"],
      },
      {
        name: "Kurnool",
        cities: ["Kurnool", "Nandyal", "Adoni", "Yemmiganur", "Dhone", "Allagadda", "Atmakur", "Nandikotkur"],
      },
      {
        name: "Nellore (SPSR Nellore)",
        cities: ["Nellore", "Kavali", "Gudur", "Venkatagiri", "Naidupeta", "Atmakur", "Sullurpeta"],
      },
      {
        name: "Prakasam",
        cities: ["Ongole", "Chirala", "Markapur", "Kandukur", "Giddalur", "Kanigiri", "Podili", "Addanki"],
      },
      {
        name: "Srikakulam",
        cities: ["Srikakulam", "Amadalavalasa", "Palasa", "Rajam", "Ichchapuram", "Sompeta", "Narasannapeta"],
      },
      {
        name: "Visakhapatnam",
        cities: ["Visakhapatnam", "Anakapalle", "Gajuwaka", "Bheemunipatnam", "Narsipatnam", "Chodavaram", "Yelamanchili", "Pendurthi"],
      },
      {
        name: "Vizianagaram",
        cities: ["Vizianagaram", "Bobbili", "Parvathipuram", "Salur", "Cheepurupalli", "Gajapathinagaram"],
      },
      {
        name: "West Godavari",
        cities: ["Eluru", "Bhimavaram", "Tadepalligudem", "Tanuku", "Palakollu", "Narasapuram", "Jangareddygudem", "Kovvur", "Nidadavole"],
      },
    ],
  },
  {
    state: "Telangana",
    districts: [
      {
        name: "Hyderabad",
        cities: ["Hyderabad", "Secunderabad", "Gachibowli", "Madhapur", "Kukatpally", "Banjara Hills", "Jubilee Hills", "Ameerpet", "Dilsukhnagar", "Begumpet", "Charminar", "Miyapur", "Uppal", "LB Nagar"],
      },
      {
        name: "Ranga Reddy",
        cities: ["Shamshabad", "Rajendranagar", "Serilingampally", "Chevella", "Ibrahimpatnam", "Shadnagar", "Maheshwaram"],
      },
      {
        name: "Medchal-Malkajgiri",
        cities: ["Malkajgiri", "Kukatpally", "Medchal", "Alwal", "Quthbullapur", "Kompally", "Kapra", "Ghatkesar"],
      },
      {
        name: "Warangal (Warangal Urban/Rural)",
        cities: ["Warangal", "Hanamkonda", "Kazipet", "Narsampet", "Parkal", "Wardhannapet"],
      },
      {
        name: "Karimnagar",
        cities: ["Karimnagar", "Huzurabad", "Jammikunta", "Choppadandi", "Manakondur"],
      },
      {
        name: "Khammam",
        cities: ["Khammam", "Madhira", "Sathupalli", "Wyra", "Kalluru"],
      },
      {
        name: "Nizamabad",
        cities: ["Nizamabad", "Bodhan", "Armoor", "Bheemgal"],
      },
      {
        name: "Nalgonda",
        cities: ["Nalgonda", "Miryalaguda", "Devarakonda", "Nakrekal"],
      },
      {
        name: "Mahabubnagar",
        cities: ["Mahabubnagar", "Jadcherla", "Badepally", "Bhoothpur"],
      },
      {
        name: "Sangareddy",
        cities: ["Sangareddy", "Patancheru", "Zaheerabad", "Ameenpur", "Sadasivpet"],
      },
      {
        name: "Siddipet",
        cities: ["Siddipet", "Gajwel", "Dubbak", "Husnabad"],
      },
      {
        name: "Bhadradri Kothagudem",
        cities: ["Kothagudem", "Bhadrachalam", "Palwancha", "Yellandu", "Manuguru"],
      },
    ],
  },
  {
    state: "Karnataka",
    districts: [
      {
        name: "Bengaluru Urban",
        cities: ["Bengaluru", "Whitefield", "Electronic City", "Indiranagar", "Koramangala", "Jayanagar", "Yelahanka", "HSR Layout", "Marathahalli", "Hebbal", "BTM Layout"],
      },
      {
        name: "Bengaluru Rural",
        cities: ["Doddaballapura", "Devanahalli", "Nelamangala", "Hosakote"],
      },
      {
        name: "Mysuru",
        cities: ["Mysuru", "Nanjangud", "Hunsur", "T. Narasipura", "K.R. Nagar"],
      },
      {
        name: "Dakshina Kannada",
        cities: ["Mangaluru", "Puttur", "Bantwal", "Belthangady", "Sullia"],
      },
      {
        name: "Belagavi",
        cities: ["Belagavi", "Gokak", "Chikkodi", "Athani", "Bailhongal", "Nippani"],
      },
      {
        name: "Dharwad",
        cities: ["Hubballi", "Dharwad", "Kundgol", "Navalgund", "Kalghatgi"],
      },
      {
        name: "Udupi",
        cities: ["Udupi", "Kundapura", "Karkala", "Manipal", "Saligrama"],
      },
    ],
  },
  {
    state: "Tamil Nadu",
    districts: [
      {
        name: "Chennai",
        cities: ["Chennai", "Adyar", "Anna Nagar", "T. Nagar", "Velachery", "Mylapore", "Tambaram", "Guindy", "Chromepet", "Porur"],
      },
      {
        name: "Coimbatore",
        cities: ["Coimbatore", "Pollachi", "Mettupalayam", "Valparai", "Sulur"],
      },
      {
        name: "Madurai",
        cities: ["Madurai", "Melur", "Thirumangalam", "Usilampatti", "Vadipatti"],
      },
      {
        name: "Kanchipuram",
        cities: ["Kanchipuram", "Sriperumbudur", "Kundrathur", "Uthiramerur", "Walajabad"],
      },
      {
        name: "Chengalpattu",
        cities: ["Chengalpattu", "Tambaram", "Pallavaram", "Maraimalai Nagar", "Mahabalipuram"],
      },
    ],
  },
  {
    state: "Maharashtra",
    districts: [
      {
        name: "Mumbai City & Suburban",
        cities: ["Mumbai", "Andheri", "Bandra", "Borivali", "Goregaon", "Powai", "Dadar", "Colaba", "Chembur", "Ghatkopar", "Kandivali", "Malad"],
      },
      {
        name: "Pune",
        cities: ["Pune", "Pimpri-Chinchwad", "Hinjawadi", "Hadapsar", "Kothrud", "Baner", "Viman Nagar", "Wakad", "Bavdhan"],
      },
      {
        name: "Thane",
        cities: ["Thane", "Navi Mumbai", "Kalyan-Dombivli", "Mira-Bhayandar", "Ulhasnagar", "Bhiwandi"],
      },
      {
        name: "Nagpur",
        cities: ["Nagpur", "Kamptee", "Umred", "Katol", "Ramtek"],
      },
    ],
  },
];

export function getDistrictsForState(stateName: string): string[] {
  const found = INDIAN_LOCATION_DATA.find(
    (s) => s.state.toLowerCase() === stateName.toLowerCase()
  );
  if (!found) return [];
  return found.districts.map((d) => d.name);
}

export function getCitiesForDistrict(stateName: string, districtName: string): string[] {
  const foundState = INDIAN_LOCATION_DATA.find(
    (s) => s.state.toLowerCase() === stateName.toLowerCase()
  );
  if (!foundState) {
    // Search across all districts
    for (const st of INDIAN_LOCATION_DATA) {
      const d = st.districts.find(
        (dis) => dis.name.toLowerCase() === districtName.toLowerCase()
      );
      if (d) return d.cities;
    }
    return [];
  }
  const foundDistrict = foundState.districts.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase()
  );
  return foundDistrict ? foundDistrict.cities : [];
}
