import type { Metadata } from 'next';
import { mockServices } from '@/lib/mock-services';
import { QUANTIFIABLE_EXTRAS, LANDSCAPING_SERVICES } from '@/lib/booking-types-enhanced';

// SEO metadata
export const metadata: Metadata = {
  title: 'Cjenik Usluga | Uredno.eu',
  description: 'Transparentne cijene usluga čišćenja u Zagrebu. Redovno čišćenje od 35€, dubinsko čišćenje od 50€, najam od 30€. Pokrivamo Zagreb i okolicu do 70km. Bez skrivenih troškova.',
  keywords: 'cjenik čišćenje Zagreb, cijene čišćenja, transparentne cijene, redovno čišćenje cijena, dubinsko čišćenje cijena, čišćenje najma cijena, pranje prozora cijena',
  openGraph: {
    title: 'Cjenik Usluga Čišćenja - Transparentne Cijene | Uredno.eu',
    description: 'Pregledaj naše transparentne cijene usluga čišćenja. Redovno čišćenje od 35€, dubinsko od 50€. Pokrivamo Zagreb i okolinu do 70km.',
    url: '/cjenik',
    siteName: 'Uredno.eu',
    locale: 'hr_HR',
    type: 'website',
  },
};

// Service categories mapping
const SERVICE_CATEGORIES: Record<string, string[]> = {
  'Redovno': ['regular', 'standard'],
  'Dubinsko': ['deep', 'post-renovation', 'move-in-out'],
  'Selidbe': ['move-in-out'],
  'Najam': ['daily_rental', 'vacation_rental'],
  'Ostalo': ['windows', 'office']
};

// Group services by categories
function groupServicesByCategory() {
  const grouped: Record<string, typeof mockServices> = {};

  Object.entries(SERVICE_CATEGORIES).forEach(([categoryName, categoryTypes]) => {
    grouped[categoryName] = mockServices.filter(service =>
      categoryTypes.includes(service.category) && service.active
    );
  });

  // Remove empty categories and duplicates
  Object.keys(grouped).forEach(category => {
    if (grouped[category].length === 0) {
      delete grouped[category];
    } else {
      // Remove duplicates
      const seen = new Set();
      grouped[category] = grouped[category].filter(service => {
        if (seen.has(service.id)) return false;
        seen.add(service.id);
        return true;
      });
    }
  });

  return grouped;
}

// Format price display
function formatPrice(minPrice: number, pricePerSqm?: number) {
  if (!pricePerSqm) {
    return `od ${minPrice} €`;
  }
  return `od ${minPrice} € (${pricePerSqm}€/m²)`;
}

export default function PricingPage() {
  const groupedServices = groupServicesByCategory();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-green-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Cjenik Usluga
            </h1>
            <p className="text-lg md:text-xl text-green-50 mb-6">
              Transparentne cijene bez skrivenih troškova
            </p>
            <div className="bg-green-800/30 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-green-100 font-medium">
                📍 Pokrivamo Zagreb i okolicu do 70km
              </p>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-6 md:h-10 fill-gray-50"
            preserveAspectRatio="none"
            viewBox="0 0 1440 48"
          >
            <path d="M0,48 L60,42 C120,36,240,24,360,20 C480,16,600,20,720,22 C840,24,960,24,1080,24 C1200,24,1320,24,1380,24 L1440,24 L1440,48 L0,48 Z" />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Services */}
        <div className="space-y-12">
          {Object.entries(groupedServices).map(([categoryName, services]) => (
            <section key={categoryName} className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">
                {categoryName}
              </h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                      service.popular ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'
                    }`}
                  >
                    {service.popular && (
                      <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-tr-xl inline-block">
                        POPULARAN
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex-1">
                          {service.name}
                        </h3>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPrice(service.min_price, service.price_per_sqm)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ~{service.duration_hours}h
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {service.description}
                      </p>

                      {service.features && service.features.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Uključuje:
                          </h4>
                          <ul className="space-y-1">
                            {service.features.slice(0, 4).map((feature, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                            {service.features.length > 4 && (
                              <li className="text-xs text-gray-500 italic">
                                + još {service.features.length - 4} stavki
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Extra Services */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">
              Dodatne Usluge
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {QUANTIFIABLE_EXTRAS.map((extra) => (
                <div
                  key={extra.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-400"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{extra.icon}</span>
                    <h3 className="font-semibold text-gray-800">{extra.name}</h3>
                  </div>
                  <div className="text-blue-600 font-bold text-lg">
                    {extra.price_per_unit}€ / {extra.unit}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Outdoor Services */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 border-b-2 border-amber-500 pb-2">
              Vanjski Prostori
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {LANDSCAPING_SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-amber-400"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{service.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-amber-600 font-bold">
                      {service.price_per_unit}€ / {service.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      min. {service.min_price}€
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Additional Information */}
        <section className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
            Važne Informacije
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📏</div>
              <h3 className="font-semibold text-gray-800 mb-2">Cijena po m²</h3>
              <p className="text-sm text-gray-600">
                Finalna cijena ovisi o veličini prostora i dodatnim uslugama
              </p>
            </div>

            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⏰</div>
              <h3 className="font-semibold text-gray-800 mb-2">Fleksibilni Termini</h3>
              <p className="text-sm text-gray-600">
                Radimo 7 dana u tjednu, uključujući blagdane i vikende
              </p>
            </div>

            <div className="bg-white/80 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Garancija</h3>
              <p className="text-sm text-gray-600">
                100% garancija zadovoljstva ili ponavljamo uslugu besplatno
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 inline-block">
              <p className="text-sm text-yellow-800">
                <strong>Napomena:</strong> Sve cijene uključuju PDV. Za udaljenosti veće od 15km naplaćujemo troškove prijevoza od 0,5€/km.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Trebate besplatan procjenu?
            </h2>
            <p className="text-lg text-green-100 mb-6">
              Kontaktirajte nas za detaljnu procjenu prilagođenu vašim potrebama
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-block"
              >
                Rezerviraj Termin
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
              >
                Kontaktiraj Nas
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}