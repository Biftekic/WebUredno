'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react';
import Logo from '../ui/Logo';
import WhatsAppButton from '../ui/WhatsAppButton';
import { PHONE_NUMBER, PHONE_NUMBER_FORMATTED, EMAIL, WHATSAPP_PHONE } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const businessInfo = {
    phone: PHONE_NUMBER,
    email: EMAIL,
    address: 'Ilica 1, 10000 Zagreb',
    hours: {
      weekdays: '07:00 - 20:00',
      saturday: '08:00 - 16:00',
      sunday: 'Zatvoreno',
    },
  };

  const services = [
    { href: '/services/redovito-ciscenje', label: 'Redovito čišćenje' },
    { href: '/services/dubinsko-ciscenje', label: 'Dubinsko čišćenje' },
    { href: '/services/useljenje-iseljenje', label: 'Useljenje/Iseljenje' },
    { href: '/services/uredski-prostori', label: 'Uredski prostori' },
  ];

  const quickLinks = [
    { href: '/o-nama', label: 'O nama' },
    { href: '/cjenik', label: 'Cjenik' },
    { href: '/rezervacija', label: 'Rezervacija' },
    { href: '/contact', label: 'Kontakt' },
  ];

  const socialLinks = [
    { href: 'https://facebook.com/uredno.eu', icon: Facebook, label: 'Facebook' },
    { href: 'https://instagram.com/uredno.eu', icon: Instagram, label: 'Instagram' },
    { href: `https://wa.me/${WHATSAPP_PHONE}`, icon: MessageCircle, label: 'WhatsApp' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Mobile-optimized padding with bottom navigation space */}
      <div className="pb-20 lg:pb-0">
        {/* CTA Section */}
        <div className="bg-green-600 py-8 px-4">
          <div className="container mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-4">
              Trebate profesionalno čišćenje?
            </h3>
            <p className="mb-6 text-green-50">
              Kontaktirajte nas danas za besplatnu procjenu
            </p>
            <WhatsAppButton variant="white" size="lg" />
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {/* Logo and Description */}
            <div className="text-center">
              <Logo className="h-10 mx-auto mb-4 text-white" />
              <p className="text-gray-400 text-sm">
                Vaš pouzdani partner za profesionalno čišćenje u Zagrebu
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-4">Kontakt informacije</h4>
              <div className="space-y-3">
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 text-green-500" />
                  <span>{PHONE_NUMBER_FORMATTED}</span>
                </a>
                <a
                  href={`mailto:${businessInfo.email}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5 text-green-500" />
                  <span>{businessInfo.email}</span>
                </a>
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{businessInfo.address}</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                Radno vrijeme
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Pon - Pet:</span>
                  <span className="font-medium">{businessInfo.hours.weekdays}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Subota:</span>
                  <span className="font-medium">{businessInfo.hours.saturday}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Nedjelja:</span>
                  <span className="font-medium">{businessInfo.hours.sunday}</span>
                </div>
              </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gray-300">Usluge</h4>
                <ul className="space-y-2">
                  {services.map((service) => (
                    <li key={service.href}>
                      <Link
                        href={service.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {service.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3 text-gray-300">Brzi linkovi</h4>
                <ul className="space-y-2">
                  {quickLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Social Links */}
            <div className="text-center">
              <h4 className="font-semibold text-sm mb-4 text-gray-300">Pratite nas</h4>
              <div className="flex justify-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <Logo className="h-10 mb-4 text-white" />
              <p className="text-gray-400 text-sm mb-6">
                Vaš pouzdani partner za profesionalno čišćenje u Zagrebu i okolici.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Naše usluge</h4>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.href}>
                    <Link
                      href={service.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Informacije</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Hours */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Kontakt</h4>
              <div className="space-y-3 mb-6">
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-green-500" />
                  {PHONE_NUMBER_FORMATTED}
                </a>
                <a
                  href={`mailto:${businessInfo.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-green-500" />
                  {businessInfo.email}
                </a>
                <div className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{businessInfo.address}</span>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-400 mb-2">Radno vrijeme:</p>
                <p className="text-sm text-gray-300">Pon-Pet: {businessInfo.hours.weekdays}</p>
                <p className="text-sm text-gray-300">Sub: {businessInfo.hours.saturday}</p>
                <p className="text-sm text-gray-300">Ned: {businessInfo.hours.sunday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
              <p>© {currentYear} Uredno.eu. Sva prava pridržana.</p>
              <div className="flex gap-6">
                <Link href="/privatnost" className="hover:text-white transition-colors">
                  Politika privatnosti
                </Link>
                <Link href="/uvjeti" className="hover:text-white transition-colors">
                  Uvjeti korištenja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}