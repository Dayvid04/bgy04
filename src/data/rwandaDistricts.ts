// Rwandan Districts (all 30 districts across the 4 provinces + City of Kigali)
export interface ProvinceDistricts {
  province: string;
  districts: string[];
}

export const RWANDA_PROVINCES_DISTRICTS: ProvinceDistricts[] = [
  {
    province: 'Kigali City',
    districts: ['Gasabo', 'Kicukiro', 'Nyarugenge']
  },
  {
    province: 'Northern Province',
    districts: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo']
  },
  {
    province: 'Southern Province',
    districts: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango']
  },
  {
    province: 'Eastern Province',
    districts: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana']
  },
  {
    province: 'Western Province',
    districts: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
  }
];

export const RWANDA_DISTRICTS: string[] = [
  // Kigali City
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
  // Northern Province
  'Musanze',
  'Gicumbi',
  'Burera',
  'Gakenke',
  'Rulindo',
  // Southern Province
  'Huye',
  'Muhanga',
  'Kamonyi',
  'Nyanza',
  'Ruhango',
  'Gisagara',
  'Nyamagabe',
  'Nyaruguru',
  // Eastern Province
  'Rwamagana',
  'Bugesera',
  'Kayonza',
  'Gatsibo',
  'Nyagatare',
  'Kirehe',
  'Ngoma',
  // Western Province
  'Rubavu',
  'Rusizi',
  'Karongi',
  'Nyabihu',
  'Rutsiro',
  'Ngororero',
  'Nyamasheke'
];
