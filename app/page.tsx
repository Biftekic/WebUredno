'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Sparkles,
  Building2,
  Package,
  Phone,
  MapPin,
  Clock,
  Shield,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Leaf,
  ThumbsUp
} from 'lucide-react';
import HeroSection from '@/components/sections/HeroSection';
import ServiceCard from '@/components/ui/ServiceCard';
import TestimonialCard from '@/components/ui/TestimonialCard';
import FAQ from '@/components/ui/FAQ';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { PHONE_NUMBER, PHONE_NUMBER_FORMATTED } from '@/lib/constants';

// Service data
const popularServices = [
  {
    id: 1,
    title: 'Osnovno čišćenje',
    description: 'Redovito održavanje čistoće vašeg doma ili poslovnog prostora',
    icon: Home,
    price: '35',
    duration: '2-3 sata',
    features: [
      'Usisavanje svih prostorija',
      'Čišćenje sanitarija',
      'Čišćenje kuhinje',
      'Iznošenje smeća'
    ],
    popular: true,
    href: '/services/redovno-ciscenje'
  },
  {
    id: 2,
    title: 'Dubinsko čišćenje',
    description: 'Temeljito čišćenje svih površina i teško dostupnih mjesta',
    icon: Sparkles,
    price: '50',
    duration: '3-4 sata',
    features: [
      'Sve usluge osnovnog čišćenja',
      'Čišćenje iza namještaja',
      'Pranje prozora iznutra',
      'Dezinfekcija površina'
    ],
    popular: false,
    href: '/services/dubinsko-ciscenje'
  },
  {
    id: 3,
    title: 'Čišćenje ureda',
    description: 'Održavanje poslovnih prostora po vašem rasporedu',
    icon: Building2,
    price: '45',
    duration: '2-3 sata',
    features: [
      'Čišćenje radnih površina',
      'Usisavanje i brisanje podova',
      'Čišćenje sanitarija',
      'Pražnjenje koševa'
    ],
    popular: false,
    href: '/services/ciscenje-ureda'
  },
  {
    id: 4,
    title: 'Selidba - čišćenje',
    description: 'Kompletno čišćenje prije useljenja ili nakon iseljenja',
    icon: Package,
    price: '60',
    duration: '3-4 sata',
    features: [
      'Čišćenje praznog prostora',
      'Dezinfekcija površina',
      'Čišćenje ormara',
      'Pranje prozora'
    ],
    popular: false,
    href: '/services/useljenje-iseljenje'
  }
];

// Testimonials data
const testimonials = [
  {
    name: 'Ana Marić',
    role: 'Vlasnica stana, Novi Zagreb',
    content: 'Uredno.eu tim je fenomenalan! Moj stan nikad nije bio čišći. Osoblje je profesionalno, brzo i temeljito. Preporučujem svima!',
    rating: 5,
    date: 'Prije 2 tjedna'
  },
  {
    name: 'Marko Horvat',
    role: 'Direktor, IT tvrtka',
    content: 'Koristimo usluge čišćenja ureda već godinu dana. Pouzdani su, fleksibilni i uvijek rade odličan posao. Naši zaposlenici su prezadovoljni.',
    rating: 5,
    date: 'Prije mjesec dana'
  },
  {
    name: 'Petra Novak',
    role: 'Majka troje djece, Dubrava',
    content: 'Kao zaposlena majka, Uredno.eu mi je spasio život! Dolaze kad mi odgovara, koriste eko proizvode sigurne za djecu i sve besprijekorno očiste.',
    rating: 5,
    date: 'Prije 3 tjedna'
  },
  {
    name: 'Ivan Jurić',
    role: 'Vlasnik restorana',
    content: 'Nakon renovacije, Uredno.eu tim je očistio sav građevinski nered. Nevjerojatno temeljiti i profesionalni. Vrhunska usluga!',
    rating: 5,
    date: 'Prije 2 mjeseca'
  }
];

// FAQ data
const faqItems = [
  {
    question: 'Koliko košta vaša usluga čišćenja?',
    answer: 'Cijena ovisi o vrsti usluge, veličini prostora i učestalosti čišćenja. Osnovno čišćenje kreće od 35 €, a točnu cijenu možemo dogovoriti nakon besplatnog pregleda prostora ili putem fotografija koje nam pošaljete.'
  },
  {
    question: 'Koje proizvode za čišćenje koristite?',
    answer: 'Koristimo profesionalne, ekološki prihvatljive proizvode sigurne za djecu i kućne ljubimce. Na zahtjev možemo koristiti i vaše proizvode za čišćenje.'
  },
  {
    question: 'Trebam li biti kod kuće tijekom čišćenja?',
    answer: 'Ne morate biti prisutni. Mnogi naši klijenti nam povjeravaju ključeve ili šifre za ulaz. Svo naše osoblje je provjereno i osigurano za vašu sigurnost.'
  },
  {
    question: 'Koliko unaprijed trebam rezervirati termin?',
    answer: 'Preporučujemo rezervaciju 1-2 tjedna unaprijed, ali često imamo slobodne termine i za hitne slučajeve. Kontaktirajte nas putem WhatsApp-a za provjeru dostupnosti.'
  },
  {
    question: 'Što ako nisam zadovoljan/na uslugom?',
    answer: 'Vaše zadovoljstvo je naš prioritet. Ako niste potpuno zadovoljni, vratit ćemo se i besplatno ispraviti sve nedostatke u roku od 24 sata.'
  },
  {
    question: 'Nudite li redovito čišćenje?',
    answer: 'Da! Nudimo tjedno, dvotjedno i mjesečno čišćenje s popustima za redovite klijente. Što je češće čišćenje, veći je popust.'
  }
];

// Process steps
const processSteps = [
  {
    number: '1',
    title: 'Kontaktirajte nas',
    description: 'Pozovite ili pošaljite poruku putem WhatsApp-a',
    icon: Phone
  },
  {
    number: '2',
    title: 'Dogovorite termin',
    description: 'Odaberite datum i vrijeme koje vam odgovara',
    icon: Clock
  },
  {
    number: '3',
    title: 'Mi čistimo',
    description: 'Naš tim dolazi i temeljito čisti vaš prostor',
    icon: Sparkles
  },
  {
    number: '4',
    title: 'Uživajte',
    description: 'Opustite se u svom čistom i svježem prostoru',
    icon: ThumbsUp
  }
];

// Benefits
const benefits = [
  {
    icon: Shield,
    title: 'Osigurani i provjereni',
    description: 'Svo osoblje je provjereno i potpuno osigurano'
  },
  {
    icon: Award,
    title: '10+ godina iskustva',
    description: 'Više od desetljeća profesionalnog čišćenja'
  },
  {
    icon: Leaf,
    title: 'Eko proizvodi',
    description: 'Koristimo ekološki prihvatljive proizvode'
  },
  {
    icon: Users,
    title: '5000+ klijenata',
    description: 'Tisuce zadovoljnih klijenata u Zagrebu'
  }
];

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <HeroSection
        title="Profesionalno čišćenje za Vaš dom i ured u Zagrebu"
        subtitle="Više od 10 godina iskustva • 5000+ zadovoljnih klijenata • Osigurano i pouzdano"
        backgroundImage="/images/cleaning-hero.jpg"
      />

      {/* Service Showcase Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge variant="primary" className="mb-4">Naše usluge</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Odaberite uslugu koja vam odgovara
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Od redovitog održavanja do dubinskog čišćenja, nudimo širok spektar usluga prilagođenih vašim potrebama
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ServiceCard {...service} showPerHour={false} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button href="/usluge" variant="outline" size="lg">
              Pogledajte sve usluge
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge variant="success" className="mb-4">Kako funkcionira</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Jednostavan proces u 4 koraka
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Od prvog kontakta do čistog prostora - sve je brzo i jednostavno
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full">
                      <ArrowRight className="w-6 h-6 text-gray-300 mx-auto" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge variant="primary" className="mb-4">Zašto mi?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Zašto odabrati Uredno.eu?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Kombinacija iskustva, profesionalnosti i povjerenja čini nas vodećim izborom za čišćenje u Zagrebu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Team Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 bg-white rounded-2xl p-8 md:p-12 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Naš profesionalni tim
                </h3>
                <p className="text-gray-600 mb-6">
                  Uredno.eu zapošljava samo provjerene i obučene profesionalce.
                  Svaki član našeg tima prolazi temeljitu obuku i redovito se educira
                  o najnovijim tehnikama čišćenja i sigurnosnim protokolima.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Provjereni i pouzdani zaposlenici</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Kontinuirana edukacija i obuka</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Potpuno osigurani za vašu sigurnost</span>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                  <p className="text-gray-700">Profesionalaca u timu</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <p className="text-gray-700">Osigurani</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
                  <p className="text-gray-700">Podrška</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">4.9</div>
                  <p className="text-gray-700">Ocjena</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge variant="warning" className="mb-4">Iskustva klijenata</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Što naši klijenti kažu
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Više od 5000 zadovoljnih klijenata u Zagrebu i okolici
            </p>
          </motion.div>

          {/* Featured Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <TestimonialCard
              {...testimonials[activeTestimonial]}
              variant="featured"
            />
          </motion.div>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TestimonialCard {...testimonial} variant="compact" />
              </motion.div>
            ))}
          </div>

          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-50 px-6 py-3 rounded-full">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-gray-900">4.9 od 5.0</span>
              <span className="text-gray-600">• 500+ recenzija</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coverage Area Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <Badge variant="info" className="mb-4">Područje djelovanja</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pokrivamo cijeli Zagreb i okolicu
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Naše usluge dostupne su u svim gradskim četvrtima i okolnim mjestima do 20km od centra grada
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Gradske četvrti koje pokrivamo
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Centar', 'Novi Zagreb', 'Trešnjevka', 'Maksimir',
                  'Dubrava', 'Pešćenica', 'Črnomerec', 'Stenjevec',
                  'Trnje', 'Medvedgrad', 'Podsused', 'Podsljeme'
                ].map((area) => (
                  <div key={area} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Okolna mjesta (do 20km)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Sesvete', 'Velika Gorica', 'Zaprešić', 'Samobor',
                  'Dugo Selo', 'Sveta Nedelja', 'Jastrebarsko', 'Brdovec',
                  'Stupnik', 'Lučko', 'Buzin', 'Odra'
                ].map((area) => (
                  <div key={area} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center"
          >
            <p className="text-gray-700">
              <strong>Napomena:</strong> Za lokacije udaljene više od 10km od centra grada može se primijeniti dodatna naknada za prijevoz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ
        items={faqItems}
        title="Često postavljena pitanja"
        description="Pronađite odgovore na najčešća pitanja o našim uslugama čišćenja"
      />

      {/* Contact CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Spremni za čist i svjež prostor?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Kontaktirajte nas danas i rezervirajte svoj termin
            </p>

            {/* Contact Options */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
              <WhatsAppButton
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100"
              />
              <Button
                href={`tel:${PHONE_NUMBER}`}
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600"
              >
                <Phone className="mr-2 w-5 h-5" />
                Pozovite: {PHONE_NUMBER_FORMATTED}
              </Button>
            </div>

            {/* Working Hours */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-200" />
                <span className="font-medium">Radno vrijeme:</span>
              </div>
              <div className="text-left">
                <div>Pon - Pet: 07:00 - 20:00</div>
                <div>Sub: 08:00 - 18:00</div>
                <div>Ned: 09:00 - 16:00</div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-4 justify-center"
            >
              <Badge variant="secondary" size="lg" className="bg-white/20 text-white border-white/30">
                <Shield className="w-4 h-4 mr-2" />
                100% Osigurano
              </Badge>
              <Badge variant="secondary" size="lg" className="bg-white/20 text-white border-white/30">
                <Award className="w-4 h-4 mr-2" />
                10+ godina iskustva
              </Badge>
              <Badge variant="secondary" size="lg" className="bg-white/20 text-white border-white/30">
                <Users className="w-4 h-4 mr-2" />
                5000+ klijenata
              </Badge>
              <Badge variant="secondary" size="lg" className="bg-white/20 text-white border-white/30">
                <Star className="w-4 h-4 mr-2" />
                4.9/5 ocjena
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}