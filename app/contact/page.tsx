import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kontakt - WebUredno | Kontaktirajte Nas za Čišćenje u Zagrebu',
  description: 'Kontaktirajte WebUredno za profesionalne usluge čišćenja u Zagrebu. ☎ 095 858 1508 | ✉ info@weburedno.hr | Brzi odgovor, fleksibilni termini.',
  alternates: {
    canonical: 'https://weburedno.hr/contact',
  },
  openGraph: {
    title: 'Kontakt - WebUredno',
    description: 'Kontaktirajte nas za besplatnu procjenu i rezervaciju termina',
    url: 'https://weburedno.hr/contact',
  },
};

const contactInfo = [
  {
    icon: Phone,
    title: 'Telefon',
    content: '095 858 1508',
    description: 'Dostupni Pon-Pet 8:00-20:00, Sub 9:00-18:00',
    action: 'tel:+385958581508'
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@weburedno.hr',
    description: 'Odgovaramo u roku 24 sata',
    action: 'mailto:info@weburedno.hr'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    content: '095 858 1508',
    description: 'Pošaljite nam poruku',
    action: 'https://wa.me/385958581508'
  },
  {
    icon: MapPin,
    title: 'Područje Djelovanja',
    content: 'Zagreb i okolica',
    description: 'Pokrivamo cijeli Zagreb i okolna mjesta do 20km',
    action: null
  },
];

const workingHours = [
  { day: 'Ponedjeljak - Petak', hours: '08:00 - 20:00' },
  { day: 'Subota', hours: '09:00 - 18:00' },
  { day: 'Nedjelja', hours: 'Po dogovoru' },
];

const faqs = [
  {
    question: 'Koliko brzo možete doći?',
    answer: 'Obično možemo organizirati termin u roku od 24-48 sati, ovisno o dostupnosti.'
  },
  {
    question: 'Koje područje pokrivate?',
    answer: 'Pokrivamo cijeli Zagreb i okolna mjesta u radijusu do 20 kilometara.'
  },
  {
    question: 'Mogu li dobiti besplatnu procjenu?',
    answer: 'Da! Nudimo besplatne procjene za sve naše usluge. Kontaktirajte nas za detalje.'
  },
  {
    question: 'Primate li hitne zahtjeve?',
    answer: 'Da, imamo mogućnost hitnih intervencija uz dodatnu naknadu.'
  },
];

export default function ContactPage() {
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
              <Link href="/about" className="text-gray-700 hover:text-green-600 transition-colors">
                O Nama
              </Link>
              <Link href="/contact" className="text-green-600 font-medium">
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
            Kontaktirajte <span className="text-green-600">Nas</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Tu smo za sve vaše upite i rezervacije. Javite nam se!
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                  {info.action ? (
                    <a
                      href={info.action}
                      className="text-green-600 font-medium hover:text-green-700 transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-green-600 font-medium">{info.content}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pošaljite Upit</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ime i Prezime
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Vaše ime"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Adresa
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="vas@email.hr"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Broj Telefona
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="095 858 1508"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    Vrsta Usluge
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">Odaberite uslugu</option>
                    <option value="dubinsko">Dubinsko čišćenje</option>
                    <option value="redovito">Redovito čišćenje</option>
                    <option value="ured">Čišćenje ureda</option>
                    <option value="gradnja">Čišćenje nakon gradnje</option>
                    <option value="prozori">Čišćenje prozora</option>
                    <option value="ostalo">Ostalo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Poruka
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                    placeholder="Opišite svoje potrebe..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Pošaljite Upit
                </button>
              </form>
            </div>

            {/* Working Hours & FAQ */}
            <div className="space-y-8">
              {/* Working Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="h-6 w-6 text-green-600 mr-3" />
                  Radno Vrijeme
                </h3>
                <div className="space-y-4">
                  {workingHours.map((schedule) => (
                    <div key={schedule.day} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{schedule.day}</span>
                      <span className="font-semibold text-gray-900">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Napomena:</strong> Za hitne slučajeve dostupni smo i izvan radnog vremena.
                  </p>
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Česta Pitanja
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 ml-7">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Područje Djelovanja
            </h2>
            <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Zagreb i Okolica
                </h3>
                <p className="text-gray-600 max-w-md">
                  Pokrivamo cijeli grad Zagreb uključujući sve gradske četvrti,
                  kao i okolna mjesta u radijusu do 20 kilometara.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['Črnomerec', 'Maksimir', 'Novi Zagreb', 'Trešnjevka', 'Dubrava', 'Stenjevec', 'Peščenica'].map((area) => (
                    <span key={area} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Trebate Brzu Pomoć?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Nazovite nas odmah ili rezervirajte termin online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+385958581508"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Nazovite Nas
            </a>
            <Link
              href="/booking"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Rezervirajte Online
            </Link>
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