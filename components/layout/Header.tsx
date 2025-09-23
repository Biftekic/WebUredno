'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppButton from '../ui/WhatsAppButton';
import Logo from '../ui/Logo';
import { PHONE_NUMBER, PHONE_NUMBER_FORMATTED } from '@/lib/constants';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
    <>
      <header className={headerClass}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="relative z-50">
              <Logo className="h-8 md:h-10" />
            </Link>

            {/* Desktop Navigation */}
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

            {/* Desktop CTA */}
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative z-50 p-2 -mr-2"
              aria-label="Meni"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-900" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu 
                      className={`w-6 h-6 ${
                        isScrolled || !transparent ? 'text-gray-900' : 'text-white'
                      }`} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white pt-20"
          >
            <nav className="container mx-auto px-4 py-8">
              <div className="flex flex-col gap-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-semibold text-gray-800 hover:text-green-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Contact */}
              <motion.div 
                className="mt-12 pt-8 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex flex-col gap-4">
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="flex items-center gap-3 text-lg font-medium text-gray-700 hover:text-green-600"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{PHONE_NUMBER_FORMATTED}</span>
                  </a>
                  <WhatsAppButton variant="primary" size="lg" className="w-full" />
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}