/**
 * Nationwide location configuration for ProConnectSA
 * Designed for easy expansion across all South African cities
 */

export interface ServiceArea {
  name: string
  city: string
  province: string
}

export interface City {
  name: string
  province: string
  areas: string[]
}

// South African provinces
export const PROVINCES = [
  'Western Cape',
  'Gauteng', 
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
] as const

// Major cities with their service areas
export const CITIES: Record<string, City> = {
  'Cape Town': {
    name: 'Cape Town',
    province: 'Western Cape',
    areas: [
      'Cape Town CBD', 'Sea Point', 'Green Point', 'Camps Bay', 'Claremont', 
      'Newlands', 'Rondebosch', 'Observatory', 'Woodstock', 'Salt River', 
      'Gardens', 'V&A Waterfront', 'Hout Bay', 'Constantia', 'Wynberg',
      'Kenilworth', 'Mowbray', 'Pinelands', 'Thornton', 'Epping', 'Parow',
      'Goodwood', 'Bellville', 'Durbanville', 'Brackenfell', 'Kuils River',
      'Somerset West', 'Stellenbosch', 'Paarl', 'Wellington', 'Milnerton',
      'Table View', 'Bloubergstrand'
    ]
  },
  
  'Johannesburg': {
    name: 'Johannesburg',
    province: 'Gauteng',
    areas: [
      'Johannesburg CBD', 'Sandton', 'Rosebank', 'Midrand', 'Randburg',
      'Roodepoort', 'Soweto', 'Alexandra', 'Fourways', 'Bryanston',
      'Hyde Park', 'Melrose', 'Parktown', 'Houghton', 'Craighall',
      'Greenside', 'Parkhurst', 'Northcliff', 'Emmarentia', 'Auckland Park',
      'Westdene', 'Sophiatown', 'Newtown', 'Hillbrow', 'Yeoville',
      'Berea', 'Bertrams', 'Jeppestown', 'Fordsburg', 'Mayfair'
    ]
  },

  'Pretoria': {
    name: 'Pretoria',
    province: 'Gauteng', 
    areas: [
      'Pretoria CBD', 'Hatfield', 'Brooklyn', 'Menlyn', 'Waterkloof',
      'Lynnwood', 'Garsfontein', 'Faerie Glen', 'Moreleta Park',
      'Silver Lakes', 'Centurion', 'Irene', 'Lyttleton', 'Erasmuskloof',
      'Arcadia', 'Sunnyside', 'Muckleneuk', 'Groenkloof', 'Lukasrand',
      'Montana', 'Sinoville', 'Annlin', 'Wonderboom', 'Akasia'
    ]
  },

  'Durban': {
    name: 'Durban',
    province: 'KwaZulu-Natal',
    areas: [
      'Durban CBD', 'Umhlanga', 'Ballito', 'La Lucia', 'Durban North',
      'Glenwood', 'Berea', 'Morningside', 'Musgrave', 'Windermere',
      'Kloof', 'Hillcrest', 'Westville', 'Pinetown', 'Chatsworth',
      'Phoenix', 'Verulam', 'Tongaat', 'Amanzimtoti', 'Scottburgh',
      'Umdloti', 'Mount Edgecombe', 'Cornubia', 'Gateway', 'Pavilion'
    ]
  },

  'Port Elizabeth': {
    name: 'Port Elizabeth',
    province: 'Eastern Cape',
    areas: [
      'Port Elizabeth CBD', 'Summerstrand', 'Humewood', 'Walmer',
      'Framesby', 'Lorraine', 'Greenacres', 'Newton Park', 'Mill Park',
      'Fairview', 'Parsons Hill', 'Mount Pleasant', 'Richmond Hill',
      'Sydenham', 'Gelvandale', 'New Brighton', 'Zwide', 'Motherwell',
      'Uitenhage', 'Despatch', 'Addo', 'Kirkwood'
    ]
  },

  'Bloemfontein': {
    name: 'Bloemfontein',
    province: 'Free State',
    areas: [
      'Bloemfontein CBD', 'Westdene', 'Willows', 'Universitas', 'Arboretum',
      'Fichardt Park', 'Pellissier', 'Bayswater', 'Waverley', 'Langenhoven Park',
      'Brandwag', 'Dan Pienaar', 'Helicon Heights', 'Woodland Hills',
      'Naval Hill', 'Parkwest', 'Ehrlichpark', 'Hospitaalpark'
    ]
  },

  'East London': {
    name: 'East London',
    province: 'Eastern Cape',
    areas: [
      'East London CBD', 'Vincent', 'Southernwood', 'Selborne', 'Berea',
      'Nahoon', 'Beacon Bay', 'Gonubie', 'Chiselhurst', 'Stirling',
      'Arcadia', 'Cambridge', 'Braelyn', 'Bonnie Doon', 'Parkridge',
      'Buffalo Flats', 'Amalinda', 'Bunkers Hill'
    ]
  }
}

// Get all cities as array
export const CITY_NAMES = Object.keys(CITIES)

// Get areas for a specific city
export const getCityAreas = (cityName: string): string[] => {
  return CITIES[cityName]?.areas || []
}

// Get all areas across all cities (for admin/search purposes)
export const getAllAreas = (): ServiceArea[] => {
  const areas: ServiceArea[] = []
  
  Object.values(CITIES).forEach(city => {
    city.areas.forEach(area => {
      areas.push({
        name: area,
        city: city.name,
        province: city.province
      })
    })
  })
  
  return areas
}

// Get cities by province
export const getCitiesByProvince = (province: string): string[] => {
  return Object.values(CITIES)
    .filter(city => city.province === province)
    .map(city => city.name)
}

// Major metros (for priority display)
export const MAJOR_METROS = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban']

// Secondary cities (for expansion)
export const SECONDARY_CITIES = ['Port Elizabeth', 'Bloemfontein', 'East London']

// Future expansion cities (ready to add)
export const EXPANSION_CITIES = [
  'Polokwane', 'Nelspruit', 'Kimberley', 'Rustenburg', 'Potchefstroom',
  'George', 'Knysna', 'Hermanus', 'Pietermaritzburg', 'Richards Bay'
]


