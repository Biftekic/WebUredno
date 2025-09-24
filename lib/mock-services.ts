// Mock services data for testing without Supabase connection
export const mockServices = [
  {
    id: '1',
    name: 'Redovno čišćenje',
    slug: 'redovno-ciscenje',
    category: 'regular',
    base_price: 35,
    price_per_sqm: 0.8,
    min_price: 35,
    duration_hours: 2,
    description: 'Redovito održavanje čistoće vašeg doma ili poslovnog prostora. Uključuje usisavanje, brisanje prašine, čišćenje sanitarija i kuhinje.',
    features: [
      'Usisavanje svih prostorija',
      'Brisanje prašine',
      'Čišćenje sanitarija',
      'Čišćenje kuhinje',
      'Iznošenje smeća',
      'Mijenjanje posteljine (po želji)'
    ],
    popular: true,
    active: true,
    display_order: 1
  },
  {
    id: '2',
    name: 'Dubinsko čišćenje',
    slug: 'dubinsko-ciscenje',
    category: 'deep',
    base_price: 50,
    price_per_sqm: 3.0,
    min_price: 50,
    duration_hours: 3,
    description: 'Temeljito čišćenje svih površina i teško dostupnih mjesta. Idealno za sezonsko čišćenje ili pripremu za posebne prilike.',
    features: [
      'Sve usluge osnovnog čišćenja',
      'Čišćenje iza i ispod namještaja',
      'Dubinsko čišćenje kuhinjskih uređaja',
      'Pranje prozora iznutra',
      'Čišćenje vrata i dovratnika',
      'Dezinfekcija površina'
    ],
    popular: true,
    active: true,
    display_order: 2
  },
  {
    id: '3',
    name: 'Čišćenje nakon renovacije',
    slug: 'ciscenje-renovacija',
    category: 'post-renovation',
    base_price: 75,
    price_per_sqm: 5.0,
    min_price: 75,
    duration_hours: 4,
    description: 'Specijalizirano čišćenje nakon renovacije ili građevinskih radova. Uklanjanje građevinske prašine i ostataka.',
    features: [
      'Uklanjanje građevinske prašine',
      'Čišćenje boje i ljepila',
      'Dubinsko usisavanje',
      'Čišćenje svih površina',
      'Pranje prozora',
      'Dezinfekcija prostora'
    ],
    popular: false,
    active: true,
    display_order: 3
  },
  {
    id: '4',
    name: 'Čišćenje za useljenje/iseljenje',
    slug: 'useljenje-iseljenje',
    category: 'move-in-out',
    base_price: 60,
    price_per_sqm: 4.0,
    min_price: 60,
    duration_hours: 3,
    description: 'Kompletno čišćenje prostora prije useljenja ili nakon iseljenja. Osigurajte besprijekoran prostor.',
    features: [
      'Čišćenje praznog prostora',
      'Dezinfekcija svih površina',
      'Čišćenje ormara iznutra',
      'Dubinsko čišćenje kuhinje',
      'Čišćenje sanitarija',
      'Pranje prozora'
    ],
    popular: false,
    active: true,
    display_order: 4
  },
  {
    id: '5',
    name: 'Pranje prozora',
    slug: 'pranje-prozora',
    category: 'windows',
    base_price: 25,
    price_per_sqm: undefined,
    min_price: 25,
    duration_hours: 2,
    description: 'Profesionalno pranje prozora, stakala i staklenih površina. Kristalno čisti prozori bez mrlja.',
    features: [
      'Pranje stakla s obje strane',
      'Čišćenje okvira',
      'Čišćenje prozorskih dasaka',
      'Uklanjanje tvrdokornih mrlja',
      'Poliranje stakla'
    ],
    popular: false,
    active: true,
    display_order: 5
  },
  {
    id: '6',
    name: 'Čišćenje ureda',
    slug: 'ciscenje-ureda',
    category: 'office',
    base_price: 45,
    price_per_sqm: 0.4,
    min_price: 45,
    duration_hours: 2,
    description: 'Održavanje poslovnih prostora. Redovito ili jednokratno čišćenje ureda.',
    features: [
      'Čišćenje radnih površina',
      'Usisavanje i brisanje podova',
      'Čišćenje sanitarija',
      'Pražnjenje koševa',
      'Čišćenje kuhinje/čajne kuhinje',
      'Brisanje prašine s opreme'
    ],
    popular: false,
    active: true,
    display_order: 6
  },
  {
    id: '7',
    name: 'Standardno čišćenje',
    slug: 'standardno-ciscenje',
    category: 'standard',
    base_price: 35,
    price_per_sqm: 1.0,
    min_price: 35,
    duration_hours: 2.5,
    description: 'Temeljito mjesečno čišćenje svih prostorija. Idealno za redovito održavanje.',
    features: [
      'Sve usluge redovnog čišćenja',
      'Dublje čišćenje kuhinje',
      'Detaljno čišćenje kupaonice',
      'Brisanje prašine s viših površina',
      'Čišćenje prekidača i kvaka'
    ],
    popular: false,
    active: true,
    display_order: 7
  },
  {
    id: '8',
    name: 'Jednodnevni najam',
    slug: 'jednodnevni-najam',
    category: 'daily_rental',
    base_price: 30,
    price_per_sqm: 0.75, // Will vary 0.5-1.0 based on frequency
    min_price: 30,
    duration_hours: 1.5,
    description: 'Brzo čišćenje između gostiju za kratkotrajni najam. Fleksibilno i efikasno.',
    features: [
      'Brzo osvježavanje prostora',
      'Promjena posteljine',
      'Čišćenje kupaonice i kuhinje',
      'Usisavanje i brisanje',
      'Iznošenje smeća',
      '24/7 dostupnost'
    ],
    popular: true,
    active: true,
    display_order: 8
  },
  {
    id: '9',
    name: 'Dubinsko čišćenje najma',
    slug: 'dubinsko-ciscenje-najma',
    category: 'vacation_rental',
    base_price: 50,
    price_per_sqm: 3.0,
    min_price: 50,
    duration_hours: 3,
    description: 'Mjesečno dubinsko čišćenje za dugoročni najam. Održavanje visokog standarda.',
    features: [
      'Kompletno dubinsko čišćenje',
      'Čišćenje tepiha i namještaja',
      'Dezinfekcija svih površina',
      'Čišćenje prozora',
      'Poliranje površina',
      'Provjera inventara'
    ],
    popular: false,
    active: true,
    display_order: 9
  }
];