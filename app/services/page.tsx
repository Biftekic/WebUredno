import { Suspense } from 'react';
import ServiceCatalog from '@/components/services/ServiceCatalog';
import LoadingState from '@/components/ui/LoadingState';

export const metadata = {
  title: 'Naše Usluge | WebUredno',
  description: 'Profesionalne usluge čišćenja u Zagrebu. Osnovno čišćenje, dubinsko čišćenje, selidbe, građevinski radovi. Povoljne cijene i pouzdana usluga.',
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-green-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Naše Usluge Čišćenja
            </h1>
            <p className="text-lg md:text-xl text-green-50 mb-6">
              Od redovitog održavanja do dubinskog čišćenja - imamo rješenje za svaku potrebu
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                <span>3 profesionalna tima</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                <span>Ekološki proizvodi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                <span>Garancija kvalitete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-8 md:h-12 fill-gray-50"
            preserveAspectRatio="none"
            viewBox="0 0 1440 48"
          >
            <path d="M0,48 L60,42 C120,36,240,24,360,20 C480,16,600,20,720,22 C840,24,960,24,1080,24 C1200,24,1320,24,1380,24 L1440,24 L1440,48 L0,48 Z" />
          </svg>
        </div>
      </section>

      {/* Service Catalog */}
      <Suspense fallback={<LoadingState message="Učitavanje usluga..." />}>
        <ServiceCatalog />
      </Suspense>
    </main>
  );
}