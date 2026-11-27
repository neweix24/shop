export type UnionArea = { name: string; upazilas: string[] };
export type DistrictArea = { name: string; upazilas: UnionArea[] };
export type DivisionArea = { name: string; districts: DistrictArea[] };

// Adapter boundary: replace or extend this fixture with the owner's verified official dataset
// before production checkout. The UI never invents a live delivery quote from this data.
export const bangladeshAreas: DivisionArea[] = [
  {
    name: "Dhaka",
    districts: [
      {
        name: "Dhaka",
        upazilas: [
          { name: "Dhanmondi", upazilas: ["Road 2", "Road 7"] },
          { name: "Uttara", upazilas: ["Sector 3", "Sector 7"] },
        ],
      },
      {
        name: "Gazipur",
        upazilas: [{ name: "Gazipur Sadar", upazilas: ["Joydebpur", "Basan"] }],
      },
      {
        name: "Narayanganj",
        upazilas: [
          { name: "Narayanganj Sadar", upazilas: ["Fatullah", "Siddhirganj"] },
        ],
      },
      {
        name: "Tangail",
        upazilas: [{ name: "Tangail Sadar", upazilas: ["Karatia", "Santosh"] }],
      },
    ],
  },
  {
    name: "Mymensingh",
    districts: [
      {
        name: "Mymensingh",
        upazilas: [
          { name: "Mymensingh Sadar", upazilas: ["Town Hall", "Kachari"] },
          { name: "Trishal", upazilas: ["Trishal Bazar"] },
        ],
      },
      {
        name: "Jamalpur",
        upazilas: [{ name: "Jamalpur Sadar", upazilas: ["Nandina"] }],
      },
      {
        name: "Netrokona",
        upazilas: [{ name: "Netrokona Sadar", upazilas: ["Madanpur"] }],
      },
      {
        name: "Sherpur",
        upazilas: [{ name: "Sherpur Sadar", upazilas: ["Sherpur Town"] }],
      },
    ],
  },
  {
    name: "Chattogram",
    districts: [
      {
        name: "Chattogram",
        upazilas: [
          { name: "Panchlaish", upazilas: ["O R Nizam Road"] },
          { name: "Patenga", upazilas: ["Airport Road"] },
        ],
      },
      {
        name: "Cox's Bazar",
        upazilas: [{ name: "Cox's Bazar Sadar", upazilas: ["Jhautola"] }],
      },
      {
        name: "Cumilla",
        upazilas: [{ name: "Cumilla Adarsha Sadar", upazilas: ["Kandirpar"] }],
      },
    ],
  },
  {
    name: "Sylhet",
    districts: [
      {
        name: "Sylhet",
        upazilas: [
          { name: "Sylhet Sadar", upazilas: ["Zindabazar", "Amberkhana"] },
        ],
      },
      {
        name: "Moulvibazar",
        upazilas: [{ name: "Moulvibazar Sadar", upazilas: ["Court Road"] }],
      },
    ],
  },
  {
    name: "Rajshahi",
    districts: [
      {
        name: "Rajshahi",
        upazilas: [{ name: "Boalia", upazilas: ["Shaheb Bazar"] }],
      },
      {
        name: "Bogura",
        upazilas: [{ name: "Bogra Sadar", upazilas: ["Thanthania"] }],
      },
    ],
  },
  {
    name: "Khulna",
    districts: [
      {
        name: "Khulna",
        upazilas: [{ name: "Khulna Sadar", upazilas: ["Sonadanga"] }],
      },
      {
        name: "Jashore",
        upazilas: [{ name: "Jashore Sadar", upazilas: ["Chanchra"] }],
      },
    ],
  },
  {
    name: "Barishal",
    districts: [
      {
        name: "Barishal",
        upazilas: [{ name: "Barishal Sadar", upazilas: ["Nathullabad"] }],
      },
      {
        name: "Patuakhali",
        upazilas: [{ name: "Patuakhali Sadar", upazilas: ["New Market"] }],
      },
    ],
  },
  {
    name: "Rangpur",
    districts: [
      {
        name: "Rangpur",
        upazilas: [{ name: "Rangpur Sadar", upazilas: ["Jahaj Company"] }],
      },
      {
        name: "Dinajpur",
        upazilas: [{ name: "Dinajpur Sadar", upazilas: ["Munshipara"] }],
      },
    ],
  },
];

// District coverage is complete at the division/district level. Only selected
// upazila/union examples are seeded above; empty children intentionally trigger
// the manual-review path instead of inventing unsupported locations.
const allDistrictsByDivision: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
  Chattogram: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  Rajshahi: [
    "Bogura",
    "Chapainawabganj",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],
  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Barishal: [
    "Barguna",
    "Barishal",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],
  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],
};

for (const division of bangladeshAreas) {
  const known = new Set(division.districts.map(district => district.name));
  for (const districtName of allDistrictsByDivision[division.name] ?? []) {
    if (!known.has(districtName)) {
      division.districts.push({ name: districtName, upazilas: [] });
    }
  }
}

export function findDivision(name: string) {
  return bangladeshAreas.find(area => area.name === name);
}
export function findDistrict(division: string, district: string) {
  return findDivision(division)?.districts.find(area => area.name === district);
}
export function findUpazila(
  division: string,
  district: string,
  upazila: string
) {
  return findDistrict(division, district)?.upazilas.find(
    area => area.name === upazila
  );
}
export const geographyStatus =
  "All 64 district names are available; verify upazila/union children against the owner's official dataset before production.";
