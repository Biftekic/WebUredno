'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Euro,
  CheckCircle,
  Star,
  Home,
  Sparkles,
  Building,
  Truck,
  Droplets,
  Briefcase,
  Shield,
  Phone,
  MessageCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import FAQ from '@/components/ui/FAQ';
import type { Service } from './ServiceCatalog';
import { PHONE_NUMBER, PHONE_NUMBER_FORMATTED, WHATSAPP_PHONE } from '@/lib/constants';

interface ServiceDetailProps {
  service: Service;
}

const categoryIcons = {
  regular: Home,
  deep: Sparkles,
  construction: Building,
  moving: Truck,
  windows: Droplets,
  office: Briefcase,
  general: Star,
  disinfection: Shield,
};

const categoryNames = {
  regular: 'Redovito čišćenje',
  deep: 'Dubinsko čišćenje',
  moving: 'Selidbe',
  construction: 'Građevinski radovi',
  windows: 'Prozori',
  office: 'Uredi',
  general: 'Generalno',
  disinfection: 'Dezinfekcija',
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ServiceDetail({ service }: ServiceDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'faq'>('overview');
  const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Home;
  const categoryName = categoryNames[service.category as keyof typeof categoryNames] || service.category;

  const getWhatsAppMessage = () => {
    const message = `Pozdrav! Zanima me usluga "${service.name}". Molim vas više informacija o cijenama i terminima.`;
    return encodeURIComponent(message);
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${getWhatsAppMessage()}`;

  // Service-specific FAQs
  const serviceFaqs = [
    {
      question: `Što sve uključuje ${service.name.toLowerCase()}?`,
      answer: `Ova usluga uključuje: ${service.features.join(', ')}. Sve navedene stavke su uključene u osnovnu cijenu usluge.`
    },
    {
      question: 'Koliko vremena traje čišćenje?',
      answer: `${service.name} obično traje ${service.duration_hours} ${service.duration_hours === 1 ? 'sat' : 'sata'}. Vrijeme može varirati ovisno o veličini prostora i specifičnim zahtjevima.`
    },
    {
      question: 'Kako se formira cijena?',
      answer: service.price_per_sqm
        ? `Osnovna cijena je od €${formatPrice(service.base_price)}, s dodatkom od ${service.price_per_sqm}€ po kvadratnom metru za veće prostore.`
        : `Minimalna cijena za ovu uslugu je od €${formatPrice(service.base_price)}.`
    },
    {
      question: 'Trebam li osigurati sredstva za čišćenje?',
      answer: 'Ne, naši timovi dolaze s profesionalnom opremom i ekološki prihvatljivim sredstvima za čišćenje. Sve što trebate je omogućiti pristup prostoru.'
    },
    {
      question: 'Mogu li otkazati ili promijeniti termin?',
      answer: 'Da, termin možete besplatno otkazati ili promijeniti do 24 sata prije zakazanog čišćenja. Za hitne promjene, kontaktirajte nas putem WhatsApp-a.'
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="container mx-auto px-4 pt-4">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Natrag na usluge</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:grid md:grid-cols-2 md:gap-8">
            {/* Left column - Info */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${service.popular ? 'bg-green-100' : 'bg-gray-100'}
                `}>
                  <Icon className={`w-6 h-6 ${service.popular ? 'text-green-600' : 'text-gray-700'}`} />
                </div>
                <Badge variant="default" size="sm">
                  {categoryName}
                </Badge>
                {service.popular && (
                  <Badge variant="success" size="sm">
                    <Star className="w-3 h-3 mr-1" />
                    Najpopularnije
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {service.name}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                {service.description}
              </p>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm text-gray-500">od</span>
                  <span className="text-3xl font-bold text-gray-900">
                    €{formatPrice(service.base_price)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Trajanje: {service.duration_hours}h</span>
                  </div>
                  {service.price_per_sqm && (
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      <span>{service.price_per_sqm}€/m²</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  href={whatsappUrl}
                  variant="primary"
                  fullWidth
                  size="lg"
                  external
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Rezerviraj putem WhatsApp
                </Button>
                <Button
                  href={`tel:${PHONE_NUMBER}`}
                  variant="outline"
                  fullWidth
                  size="lg"
                  external
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Nazovi: {PHONE_NUMBER_FORMATTED}
                </Button>
              </div>
            </div>

            {/* Right column - Image */}
            <div className="relative h-64 md:h-auto bg-gradient-to-br from-green-50 to-green-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-32 h-32 text-green-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 pb-12">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              px-4 py-2 font-medium transition-all relative
              ${activeTab === 'overview'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Pregled
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`
              px-4 py-2 font-medium transition-all relative
              ${activeTab === 'details'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Što uključuje
            {activeTab === 'details' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`
              px-4 py-2 font-medium transition-all relative
              ${activeTab === 'faq'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Česta pitanja
            {activeTab === 'faq' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl p-6 md:p-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Zašto odabrati ovu uslugu?
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Prednosti
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Profesionalna oprema i sredstva</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Osiguran i verificiran tim</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Garancija kvalitete usluge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">Fleksibilni termini</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Idealno za
                    </h3>
                    <ul className="space-y-2">
                      {service.category === 'regular' && (
                        <>
                          <li className="text-gray-700">• Redovito održavanje doma</li>
                          <li className="text-gray-700">• Zaposlene obitelji</li>
                          <li className="text-gray-700">• Starije osobe</li>
                          <li className="text-gray-700">• Male poslovne prostore</li>
                        </>
                      )}
                      {service.category === 'deep' && (
                        <>
                          <li className="text-gray-700">• Sezonsko čišćenje</li>
                          <li className="text-gray-700">• Pripremu za blagdane</li>
                          <li className="text-gray-700">• Nakon renovacije</li>
                          <li className="text-gray-700">• Godišnje dubinsko čišćenje</li>
                        </>
                      )}
                      {service.category === 'moving' && (
                        <>
                          <li className="text-gray-700">• Useljenje u novi prostor</li>
                          <li className="text-gray-700">• Iseljenje iz stana</li>
                          <li className="text-gray-700">• Pripremu za najam</li>
                          <li className="text-gray-700">• Prodaju nekretnine</li>
                        </>
                      )}
                      {service.category === 'construction' && (
                        <>
                          <li className="text-gray-700">• Nakon renovacije</li>
                          <li className="text-gray-700">• Građevinske radove</li>
                          <li className="text-gray-700">• Adaptaciju prostora</li>
                          <li className="text-gray-700">• Završne radove</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Što sve uključuje {service.name.toLowerCase()}?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Dodatne opcije
                </h3>
                <p className="text-green-800 text-sm mb-3">
                  Možete dodati sljedeće usluge uz osnovni paket:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Pranje prozora (+15€)
                  </li>
                  <li className="flex items-center gap-2 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Čišćenje tepiha (+20€ po tepihu)
                  </li>
                  <li className="flex items-center gap-2 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Dezinfekcija prostora (+25€)
                  </li>
                  <li className="flex items-center gap-2 text-green-800">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Organizacija prostora (+30€)
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Česta pitanja o usluzi
              </h2>
              <FAQ items={serviceFaqs} />
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}