import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  Clock,
  Award,
  Users,
  Sparkles,
  CheckCircle,
  Phone,
  Home,
  Building2,
  Leaf
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'O Nama - WebUredno | Vaš Partner za Čišćenje u Zagrebu',
  description: 'Saznajte više o WebUredno - vodećoj tvrtki za profesionalno čišćenje u Zagrebu. 10+ godina iskustva, 500+ zadovoljnih klijenata, ekološki proizvodi.',
  alternates: {
    canonical: 'https://weburedno.hr/about',
  },
  openGraph: {
    title: 'O Nama - WebUredno',
    description: 'Profesionalne usluge čišćenja s više od 10 godina iskustva',
    url: 'https://weburedno.hr/about',
  },
};

const stats = [
  { number: '10+', label: 'Godina Iskustva' },
  { number: '500+', label: 'Zadovoljnih Klijenata' },
  { number: '1000+', label: 'Očišćenih Prostora' },
  { number: '24/7', label: 'Podrška Klijentima' },
];

const values = [
  {
    icon: Shield,
    title: 'Pouzdanost',
    description: 'Uvijek možete računati na nas. Dolazimo na vrijeme i obavljamo posao profesionalno.'
  },
  {
    icon: Sparkles,
    title: 'Kvaliteta',
    description: 'Koristimo samo najbolje proizvode i tehnike za savršene rezultate.'
  },
  {
    icon: Leaf,
    title: 'Ekološka Svijest',
    description: 'Ekološki prihvatljivi proizvodi sigurni za vašu obitelj i kućne ljubimce.'
  },
  {
    icon: Users,
    title: 'Fokus na Klijente',
    description: 'Vaše zadovoljstvo je naš prioritet. Prilagođavamo se vašim potrebama.'
  },
];

const services = [
  { icon: Home, text: 'Čišćenje domova i stanova' },
  { icon: Building2, text: 'Čišćenje poslovnih prostora' },
  { icon: Sparkles, text: 'Dubinsko čišćenje' },
  { icon: Clock, text: 'Redovito održavanje' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50/30">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">WebUredno</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors">
                Početna
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-green-600 transition-colors">
                Usluge
              </Link>
              <Link href="/about" className="text-green-600 font-medium">
                O Nama
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">
                Kontakt
              </Link>
              <Link
                href="/booking"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Rezerviraj Termin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O <span className="text-green-600">WebUredno</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Vaš pouzdani partner za profesionalno čišćenje u Zagrebu
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Naša Priča</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                WebUredno je osnovana 2014. godine s jasnom vizijom - pružiti vrhunske usluge
                čišćenja koje nadmašuju očekivanja naših klijenata. Započeli smo kao mala
                obiteljska tvrtka, a danas smo jedan od vodećih pružatelja usluga čišćenja u Zagrebu.
              </p>
              <p>
                Tijekom godina, izgradili smo tim stručnih i pouzdanih profesionalaca koji
                dijele našu strast za savršenstvom. Svaki član našeg tima prolazi rigoroznu
                obuku i redovito se educira o najnovijim tehnikama i standardima čišćenja.
              </p>
              <p>
                Ponosni smo na povjerenje koje su nam ukazali brojni klijenti - od obitelji
                do velikih korporacija. Naš uspjeh temelji se na jednostavnoj filozofiji:
                tretirati svaki prostor kao da je naš vlastiti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-green-600">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Naše Vrijednosti
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Što Nudimo?
              </h2>
              <p className="text-gray-600 mb-8">
                Pružamo širok spektar profesionalnih usluga čišćenja prilagođenih
                vašim potrebama. Od redovitog održavanja do dubinskog čišćenja,
                tu smo za vas.
              </p>
              <div className="space-y-4">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{service.text}</span>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/services"
                className="inline-flex items-center mt-8 text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                Pogledaj sve usluge →
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Zašto WebUredno?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Licencirani i osigurani profesionalci</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Fleksibilni termini prilagođeni vama</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Transparentne cijene bez skrivenih troškova</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Garancija zadovoljstva</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Ekološki prihvatljivi proizvodi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Spremni za Čist i Svjež Prostor?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Kontaktirajte nas danas i saznajte kako vam možemo pomoći
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Rezerviraj Termin
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Kontaktiraj Nas
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center text-white">
            <Phone className="h-5 w-5 mr-2" />
            <span className="text-lg">095 858 1508</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2024 WebUredno. Sva prava pridržana.</p>
        </div>
      </footer>
    </main>
  );
}