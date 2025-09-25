'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import WhatsAppButton from '../ui/WhatsAppButton';
import Logo from '../ui/Logo';
import { PHONE_NUMBER, PHONE_NUMBER_FORMATTED } from '@/lib/constants';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300
    ${isScrolled || !transparent
      ? 'bg-white shadow-md'
      : 'bg-transparent'}
  `;

  const navItems = [
    { href: '/', label: 'Početna' },
    { href: '/usluge', label: 'Usluge' },
    { href: '/cjenik', label: 'Cjenik' },
    { href: '/o-nama', label: 'O nama' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="relative z-50">
            <Logo className="h-8 md:h-10" />
          </Link>

          {/* Desktop Navigation - Keep as is */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  font-medium transition-colors
                  ${isScrolled || !transparent
                    ? 'text-gray-700 hover:text-green-600'
                    : 'text-white hover:text-green-300'}
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA - Keep as is */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${PHONE_NUMBER}`}
              className={`
                flex items-center gap-2 font-medium transition-colors
                ${isScrolled || !transparent
                  ? 'text-gray-700 hover:text-green-600'
                  : 'text-white hover:text-green-300'}
              `}
            >
              <Phone className="w-4 h-4" />
              <span>{PHONE_NUMBER_FORMATTED}</span>
            </a>
            <WhatsAppButton variant="primary" size="md" />
          </div>

          {/* Mobile WhatsApp Button - Simplified for mobile */}
          <div className="lg:hidden">
            <WhatsAppButton variant="primary" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}