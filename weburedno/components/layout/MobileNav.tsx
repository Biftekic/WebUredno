'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Calendar, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Početna', icon: Home },
  { href: '/usluge', label: 'Usluge', icon: Briefcase },
  { href: '/rezervacija', label: 'Rezerviraj', icon: Calendar },
  { href: '/kontakt', label: 'Kontakt', icon: Phone },
  { href: '/profil', label: 'Profil', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                              (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center flex-1 h-full py-2 group"
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-0 left-0 right-0 h-0.5 bg-green-600"
                      initial={false}
                    />
                  )}

                  {/* Icon container with touch feedback */}
                  <div className="relative">
                    <div
                      className={`
                        p-1.5 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-green-50'
                          : 'group-active:bg-gray-100'}
                      `}
                    >
                      <Icon
                        className={`
                          w-5 h-5 transition-colors
                          ${isActive
                            ? 'text-green-600'
                            : 'text-gray-500 group-active:text-gray-700'}
                        `}
                      />
                    </div>

                    {/* Notification dot (for future use) */}
                    {item.href === '/profil' && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-[10px] mt-0.5 font-medium transition-colors
                      ${isActive
                        ? 'text-green-600'
                        : 'text-gray-500 group-active:text-gray-700'}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Safe area padding for devices with home indicator */}
          <div className="h-safe-area-inset-bottom bg-white" />
        </motion.nav>
      )}
    </AnimatePresence>
  );
}